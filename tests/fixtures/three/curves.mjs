import { CatmullRomCurve3, CubicBezierCurve3, CurvePath, EllipseCurve, ExtrudeGeometry, LatheGeometry, LineCurve3, Path, QuadraticBezierCurve, QuadraticBezierCurve3, Shape, ShapeGeometry, ShapeUtils, TubeGeometry, Vector2, Vector3 } from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

// curves-numeric
{
    const curve = new CatmullRomCurve3([new Vector3(), new Vector3(1, 2, 0), new Vector3(3, 0, 0)]);
    console.log('curve', curve.getPoint(0.5).y, Number(curve.getLength()).toFixed(4), curve.getSpacedPoints(4).length, curve.getTangent(0.5).length().toFixed(3));
    const bezier = new CubicBezierCurve3(new Vector3(), new Vector3(1, 0, 0), new Vector3(1, 1, 0), new Vector3(2, 1, 0));
    console.log('bezier', bezier.getPoint(0.5).x);
    const q = new QuadraticBezierCurve(new Vector2(), new Vector2(1, 2), new Vector2(2, 0));
    console.log('q', q.getPoint(0.5).y);
    console.log('ellipse', new EllipseCurve(0, 0, 2, 1, 0, Math.PI, false, 0).getPoints(4).length);
    const path = new CurvePath();
    path.add(new LineCurve3(new Vector3(), new Vector3(1, 0, 0)));
    path.add(new LineCurve3(new Vector3(1, 0, 0), new Vector3(1, 2, 0)));
    console.log('path', path.getLength(), path.getPoint(0.5).y);
}

// curves-simple
{
    const v = new Vector3();
    console.log('line', new LineCurve3(v, new Vector3(0, 2, 0)).getPoint(0.5).y);
    console.log('quadratic', new QuadraticBezierCurve3(v, new Vector3(1, 2, 0), new Vector3(2, 0, 0)).getPoint(0.5).y);
    console.log('cubic', new CubicBezierCurve3(v, new Vector3(1, 0, 0), new Vector3(1, 1, 0), new Vector3(2, 1, 0)).getPoint(0.5).x);
    console.log('ellipse', new EllipseCurve(0, 0, 2, 1, 0, Math.PI, false, 0).getPoints(4).length);
}

// shapes-extrusion
{
    const shape = new Shape();
    shape.moveTo(0, 0);
    shape.lineTo(3, 0);
    shape.lineTo(3, 3);
    shape.lineTo(0, 3);
    shape.closePath();
    const hole = new Path();
    hole.moveTo(1, 1);
    hole.lineTo(1, 2);
    hole.lineTo(2, 2);
    hole.lineTo(2, 1);
    hole.closePath();
    shape.holes.push(hole);
    const points = shape.extractPoints(4);
    console.log('points', points.shape.length, points.holes.length);
    const flat = new ShapeGeometry(shape);
    const solid = new ExtrudeGeometry(shape, { depth: 2, bevelEnabled: false });
    console.log('geometry', flat.attributes.position.count, flat.index.count, solid.attributes.position.count, solid.groups.length);
    console.log('triangles', ShapeUtils.triangulateShape(points.shape, points.holes).length);
}

// tube-lathe
{
    const curve = new CatmullRomCurve3([new Vector3(), new Vector3(0, 1, 0), new Vector3(1, 2, 0)]);
    const tube = new TubeGeometry(curve, 8, 0.2, 4, false);
    console.log('tube', tube.attributes.position.count, tube.index.count, tube.tangents.length);
    const lathe = new LatheGeometry([new Vector2(0, 0), new Vector2(1, 1), new Vector2(0, 2)], 8);
    console.log('lathe', lathe.attributes.position.count, lathe.index.count);
}

// font-text
{
    const font = new FontLoader().parse({ resolution: 1000, boundingBox: { yMin: 0, yMax: 1000 }, underlineThickness: 50, glyphs: { A: { ha: 1000, x_min: 0, x_max: 1000, o: 'm 0 0 l 500 1000 l 1000 0 l 0 0' } } });
    const shapes = font.generateShapes('A', 1);
    console.log('font', shapes.length);
    const g = new TextGeometry('A', { font, size: 1, depth: 0.2, bevelEnabled: false });
    console.log('text', g.attributes.position.count);
}
