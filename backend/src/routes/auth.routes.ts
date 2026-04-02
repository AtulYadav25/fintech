import { FastifyInstance } from "fastify";
import * as AuthController from "../controllers/auth.controller"
import { signUpSchema } from "../validators/auth.schema";

export const authRoutes = async (app: FastifyInstance) => {

    //SignUp User
    app.post("/signup", { schema: { body: signUpSchema } }, AuthController.signUpUser)
}