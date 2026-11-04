import { AnimationClip, AnimationLoader, AnimationMixer, AnimationObjectGroup, AnimationUtils, BooleanKeyframeTrack, Group, InterpolateDiscrete, LoopOnce, LoopRepeat, NumberKeyframeTrack, Object3D, PropertyBinding, QuaternionKeyframeTrack, StringKeyframeTrack, VectorKeyframeTrack } from "three";

// animation-tracks
{
    const number = new NumberKeyframeTrack('.position[x]', [0, 1, 2], [0, 10, 20]);
    console.log('number', number.createInterpolant().evaluate(0.5)[0], number.validate());
    number.trim(0.5, 2).shift(1).scale(2);
    console.log('trim', number.times[0], number.times.length);
    const vector = new VectorKeyframeTrack('.position', [0, 1], [0, 0, 0, 2, 4, 6]);
    console.log('vector', vector.createInterpolant().evaluate(0.5)[1]);
    const quat = new QuaternionKeyframeTrack('.quaternion', [0, 1], [0, 0, 0, 1, 0, 1, 0, 0]);
    console.log('quat', quat.createInterpolant().evaluate(0.5)[1].toFixed(4));
    const flag = new BooleanKeyframeTrack('.visible', [0, 1], [true, false]);
    console.log('bool', flag.createInterpolant().evaluate(0.5)[0]);
    const text = new StringKeyframeTrack('.name', [0, 1], ['a', 'b']);
    console.log('string', text.createInterpolant().evaluate(1)[0]);
    const clip = new AnimationClip('test', -1, [vector]);
    console.log('clip', clip.duration, clip.clone().tracks.length);
}

// animation-mixer
{
    const root = new Object3D();
    const binding = new PropertyBinding(root, '.position');
    binding.setValue([2, 4, 6], 0);
    const values = [0, 0, 0];
    binding.getValue(values, 0);
    console.log('whole-vector', values.join(','), root.matrixWorldNeedsUpdate);
    binding.unbind();
    const mixer = new AnimationMixer(root);
    mixer.clipAction(new AnimationClip('vector', 1, [new VectorKeyframeTrack('.position', [0, 1], [0, 0, 0, 2, 4, 6])])).play();
    mixer.update(0.5);
    console.log('vector-playback', root.position.x, root.position.y, root.position.z);
    mixer.stopAllAction();
    mixer.uncacheRoot(root);
}

{
    const root = new Object3D(), mixer = new AnimationMixer(root), clip = new AnimationClip('move', 1, [new NumberKeyframeTrack('.position[x]', [0, 1], [0, 10])]);
    const action = mixer.clipAction(clip);
    action.play();
    mixer.update(0.25);
    console.log('quarter', root.position.x, action.isRunning());
    mixer.update(0.5);
    console.log('threequarters', root.position.x);
    action.setLoop(LoopOnce, 1);
    action.clampWhenFinished = true;
    mixer.update(1);
    console.log('end', root.position.x, action.paused);
    mixer.stopAllAction();
    mixer.uncacheRoot(root);
    console.log('uncached', mixer.existingAction(clip) === null);
}

// animation-crossfade
{
    const root = new Object3D(), mixer = new AnimationMixer(root);
    const a = mixer.clipAction(new AnimationClip('a', 2, [new NumberKeyframeTrack('.position[x]', [0, 2], [0, 10])]));
    const b = mixer.clipAction(new AnimationClip('b', 2, [new NumberKeyframeTrack('.position[x]', [0, 2], [10, 20])]));
    a.play();
    mixer.update(0.25);
    b.reset().play().crossFadeFrom(a, 0.5, false);
    mixer.update(0.25);
    console.log('blend', root.position.x.toFixed(4), a.getEffectiveWeight().toFixed(3), b.getEffectiveWeight().toFixed(3));
    mixer.update(0.25);
    console.log('complete', a.getEffectiveWeight(), b.getEffectiveWeight());
}

// property-binding
{
    const root = new Group(), child = new Object3D();
    child.name = 'child';
    root.add(child);
    const binding = new PropertyBinding(root, 'child.position[x]');
    binding.bind();
    const values = [7];
    binding.setValue(values, 0);
    const result = [0];
    binding.getValue(result, 0);
    console.log('binding', child.position.x, result[0]);
    binding.unbind();
    const group = new AnimationObjectGroup(root, child);
    console.log('group', group.stats.objects.total, group.stats.objects.inUse);
    group.remove(child);
    console.log('removed', group.stats.objects.inUse);
}

// loader-animation
{
    const clip = new AnimationClip('move', 1, [new NumberKeyframeTrack('.position[x]', [0, 1], [0, 1])]);
    const result = new AnimationLoader().parse([clip.toJSON()]);
    console.log('animation', result.length, result[0].name, result[0].tracks[0].values[1]);
}
