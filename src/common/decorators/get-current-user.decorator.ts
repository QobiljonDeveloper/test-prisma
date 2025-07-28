import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { JwtPayloadWIthRefreshToken } from "../types";

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayloadWIthRefreshToken, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayloadWIthRefreshToken;

    if (!user) {
      throw new ForbiddenException("Token noto'g'ri");
    }

    if (!data) {
      return user;
    }

    return user[data];
  }
);
