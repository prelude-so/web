export default class Network {
  constructor(public cellularData: boolean | null = null) {}

  static collect(): Network {
    const network = new Network();

    const connection =
      // @ts-ignore
      navigator.connection ||
      // @ts-ignore
      navigator.mozConnection ||
      // @ts-ignore
      navigator.webkitConnection;

    if (connection) {
      network.cellularData = "cellular" === connection.type;
    }

    return network;
  }
}
