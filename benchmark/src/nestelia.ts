import "reflect-metadata";
import { Controller, Get, Module, createElysiaApplication } from "../../index";

@Controller()
class AppController {
  @Get("/")
  index() {
    return "Hello World";
  }
}

@Module({ controllers: [AppController] })
class AppModule {}

const port = Number(process.env.PORT) || 3000;
const app = await createElysiaApplication(AppModule, { logger: false });
app.listen(port, () => {
  process.send?.("ready");
});
