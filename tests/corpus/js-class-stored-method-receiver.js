class Track {
  constructor(value = 2) { this.value = value; this.factory = this.create; }
  size() { return this.value; }
  create(multiplier = 1) { return this.size() * multiplier; }
}
const tracks = [new Track(), new Track(4)];
for (const track of tracks) console.log(track.factory(3));
console.log(tracks[1].factory());
const dynamic = JSON.parse('{}');
dynamic.track = tracks[0];
console.log(dynamic.track.factory(5));
const shared = tracks[0].factory;
tracks[1].factory = shared;
console.log(tracks[1].factory(2));
