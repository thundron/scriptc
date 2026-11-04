import { ArrayCamera, Color, ColorManagement, Euler, Line3, LinearSRGBColorSpace, MathUtils, Matrix2, Matrix3, Matrix4, OrthographicCamera, PerspectiveCamera, Quaternion, SRGBColorSpace, SphericalHarmonics3, StereoCamera, Vector3, Vector4 } from "three";

// math-extended
{
    const v = new Vector4(1, 2, 3, 4).multiplyScalar(2);
    console.log('v4', v.x, v.w, v.length().toFixed(4));
    const m = new Matrix3().set(2, 0, 0, 0, 3, 0, 0, 0, 4);
    console.log('m3', m.determinant(), m.clone().invert().elements[0]);
    const a = new Vector3(), q = new Quaternion(), s = new Vector3();
    new Matrix4().makeTranslation(2, 3, 4).decompose(a, q, s);
    console.log('decompose', a.x, a.y, a.z, s.x, q.w);
    const color = new Color('#ff0000');
    color.setHSL(0.5, 1, 0.5);
    console.log('color', color.getHexString(), color.getStyle());
    console.log('math', MathUtils.clamp(5, 0, 3), MathUtils.euclideanModulo(-1, 4), MathUtils.lerp(2, 6, 0.5));
    const sh = new SphericalHarmonics3();
    sh.coefficients[0].set(1, 2, 3);
    console.log('sh', sh.getAt(new Vector3(0, 1, 0), new Vector3()).x.toFixed(4));
    console.log('line', new Line3(new Vector3(), new Vector3(2, 0, 0)).closestPointToPoint(new Vector3(1, 2, 0), true, new Vector3()).x);
}

// color-management
{
    const c = new Color().setRGB(0.5, 0.25, 0.75, SRGBColorSpace);
    console.log(c.r.toFixed(6), c.g.toFixed(6), c.b.toFixed(6));
    console.log(c.clone().convertLinearToSRGB().r.toFixed(4), c.getHexString(SRGBColorSpace));
    ColorManagement.enabled = false;
    console.log(new Color(0x808080).r.toFixed(4));
    ColorManagement.enabled = true;
}

// camera-tolerance
{
    const camera = new PerspectiveCamera(60, 2, 0.1, 100);
    camera.position.z = 5;
    camera.updateMatrixWorld();
    const p = new Vector3(1, 2, 0).project(camera).unproject(camera);
    console.log('project', Math.abs(p.x - 1) < 1e-10, Math.abs(p.y - 2) < 1e-10, Math.abs(p.z) < 1e-10);
    camera.setViewOffset(800, 600, 0, 0, 400, 300);
    camera.updateProjectionMatrix();
    console.log('view', camera.view.enabled, camera.view.width, Number(camera.projectionMatrix.elements[8]).toFixed(3));
    camera.clearViewOffset();
    console.log('clear', camera.view.enabled);
    const stereo = new StereoCamera();
    stereo.update(camera);
    console.log('stereo', stereo.cameraL.isPerspectiveCamera, Number(stereo.cameraR.matrixWorld.elements[12]).toFixed(4));
    console.log('array', new ArrayCamera([camera]).cameras.length);
}
