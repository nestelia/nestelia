export class RpcTimeoutError extends Error {
  constructor(
    public readonly timeout: number,
    public readonly exchange: string,
    public readonly routingKey: string,
  ) {
    super(
      `Failed to receive response within timeout of ${timeout}ms for exchange "${exchange}" and routing key "${routingKey}"`,
    );
    this.name = "RpcTimeoutError";
  }
}

export class NullMessageError extends Error {
  constructor() {
    super("Received null message");
    this.name = "NullMessageError";
  }
}

export class ChannelNotAvailableError extends Error {
  constructor() {
    super("channel is not available");
    this.name = "ChannelNotAvailableError";
  }
}

export class ConnectionNotAvailableError extends Error {
  constructor() {
    super("connection is not available");
    this.name = "ConnectionNotAvailableError";
  }
}
