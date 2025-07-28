import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { JwtPayload } from "../types";

export const GetCurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    const user = request.euser as JwtPayload;
    if (!user) {
      throw new ForbiddenException("Token noto'g'ri");
    }
    console.log("user", user);

    return user.id;
  }
);
