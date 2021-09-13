import ethService, {EthService} from "./ethService";


describe("ethService", ()=> {
  test("constructor()", async ()=> {
    expect(ethService).toBeInstanceOf(EthService)
  })
})
