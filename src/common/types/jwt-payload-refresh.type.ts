import { JwtPayload } from "./jwt-payload.type";

export type JwtPayloadWIthRefreshToken = JwtPayload & { refreshToken: string };
