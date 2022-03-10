import { createClient } from "redis";
import { User, UserClaim } from "../entity/User";
import { nanoid } from "nanoid";
import { Inject, Service } from "typedi";

@Service()
export class SessionService {
  private secret: string;
  constructor(
    @Inject("redis") private readonly redis: ReturnType<typeof createClient>
  ) {
    this.secret = process.env.JWT_SECRET ?? "keyboard cat";
  }

  async createSession(user: User): Promise<string> {
    const jti = nanoid();
    const claim = {
      sub: user.username,
      roles: user.roles,
      jti,
    };
    await this.redis.eval(
      `
      local sub = ARGV[1];
      local jti = ARGV[2];
      local claim = ARGV[3];
      local key = 'session:' .. jti;
      local skey = 'sessions:' .. sub;
      redis.call('set', key, claim);
      redis.call('sadd', skey, jti);
    `,
      {
        arguments: [claim.sub, claim.jti, JSON.stringify(claim)],
      }
    );

    return jti;
  }

  async verifySession(session: string): Promise<UserClaim | null> {
    const claimStr = await this.redis.get(`session:${session}`);
    if (!claimStr) {
      return null;
    }
    const claim = JSON.parse(claimStr) as UserClaim;
    return claim;
  }

  async destroySession(session: string) {
    await this.redis.eval(
      `
      local jti = ARGV[1];
      local key = 'session:' .. jti;
      -- parse json to get sub
      local claim = cjson.decode(redis.call('get', key));
      local sub = claim.sub;
      local skey = 'sessions:' .. sub;
      redis.call('del', key);
      redis.call('srem', skey, jti);
    `,
      {
        arguments: [session],
      }
    );
    await this.redis.del(`session:${session}`);
  }

  async destroyUserSessions(username: string) {
    await this.redis.eval(
      `
      local username = ARGV[1];
      local skey = 'sessions:' .. username;
      local cursor = '0';
      repeat
        local results = redis.call('sscan', skey, cursor)
        cursor = results[1]
        for _, jti in ipairs(results[2]) do
          local key = 'session:' .. jti;
          redis.call('del', key);
        end
      until cursor == '0'
      redis.call('del', skey);
    `,
      {
        arguments: [username],
      }
    );
  }
}
