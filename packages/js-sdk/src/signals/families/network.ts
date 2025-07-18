export default class Network {
  constructor(public cellularData: boolean | null = null) {}

  static collect(): Network {
    const network = new Network();

    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      network.cellularData = "cellular" === connection.type;
    }

    return network;
  }
}
