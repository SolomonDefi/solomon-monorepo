import mailService from './service/mailService';
import ethService from "./service/ethService";

let start = async () => {
  await mailService.init()
  await ethService.init()
}

start()
