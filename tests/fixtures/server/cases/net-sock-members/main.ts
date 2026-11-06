/* The socket member follow-ups: setTimeout + the 'timeout' event (the
 * isPortListening shape — connect, arm the idle timer, destroy on
 * whichever of connect/timeout fires), remoteAddress on both ends of a
 * live connection (the accepted side of a mapped-loopback listener reads
 * the v4-mapped form), the undefined arm after destroy, and `writable`
 * through the write half's whole life (true connected, false after end()
 * — Node's stream flag; the proxy's "may I still answer 502" guard).
 * Ping-pong ordered: the server side drives the shutdown. */
import { createServer, connect } from "node:net";

const server = createServer((sock) => {
  // Logged at DATA arrival, not accept: the accept-vs-connect emit order
  // is a race in both lanes; the ping makes it causal.
  sock.on("data", () => {
    const ra = sock.remoteAddress;
    console.log(`srv got ping remote=${ra !== undefined ? ra : "gone"} writable=${sock.writable}`);
    sock.end("bye");
    console.log(`srv after end writable=${sock.writable}`);
  });
  sock.on("close", () => {
    console.log("srv sock closed");
    // Leg 2 chains off the LAST first-leg event (starting it from the
    // client's 'close' races these teardown logs against the new
    // connection's events).
    server.close(() => {
      console.log("srv closed");
      idleLeg();
    });
  });
});

// Bind the mapped loopback address explicitly. On Darwin, a wildcard
// IPv6 ephemeral port can overlap a parallel IPv4 listener's port.
server.listen(0, "::ffff:127.0.0.1", () => {
  const port = server.address().port;
  // Leg 1: a connection that answers — 'connect' wins, timeout never fires.
  const alive = connect(port, "127.0.0.1");
  alive.setTimeout(2000);
  alive.once("connect", () => {
    const ra = alive.remoteAddress;
    console.log(`cli connected remote=${ra !== undefined ? ra : "gone"} writable=${alive.writable}`);
    alive.write("ping");
  });
  alive.once("timeout", () => console.log("cli timeout?!"));
  alive.on("data", (chunk) => console.log(`cli got ${chunk.toString("utf8")}`));
  alive.on("end", () => console.log("cli end"));
  alive.on("close", () => {
    // Read WHILE CONNECTED above → Node caches it; the read here, after
    // close, still answers the address (the never-read idle socket below
    // answers undefined instead).
    const ra = alive.remoteAddress;
    console.log(`cli closed remote=${ra !== undefined ? ra : "gone"}`);
  });
});

function idleLeg(): void {
  // Leg 2: a connection nobody answers — the idle timer fires. The quiet
  // server's handler logs nothing (accept-vs-connect order is a race in
  // both lanes); its socket is never read, so remoteAddress after close
  // is the undefined arm.
  // The data listener keeps the accepted socket flowing so the client's
  // FIN is noticed and quiet.close() can drain (divergence 48: a
  // consumer-less socket never sees EOF — true of Node's paused sockets
  // too). It logs nothing: accept-vs-connect order is a race.
  const quiet = createServer((s) => {
    s.on("data", () => {});
  });
  quiet.listen(0, "127.0.0.1", () => {
    const sock = connect(quiet.address().port, "127.0.0.1");
    sock.setTimeout(250);
    sock.once("connect", () => console.log("idle connected"));
    sock.once("timeout", () => {
      console.log("idle timeout");
      sock.destroy();
    });
    sock.on("close", () => {
      const ra = sock.remoteAddress;
      console.log(`idle closed remote=${ra !== undefined ? ra : "gone"}`);
      quiet.close(() => console.log("quiet closed"));
    });
  });
}
