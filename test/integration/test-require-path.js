var assert = require('assert');
var SandboxedModule = require('../..');

var requiredPaths = [];

var foo = SandboxedModule.require('../fixture/foo', {
  resolvePath: function (path, resolve, requiredFromPath) {
    requiredPaths.push(path);

    var resolved = resolve(path);
    if (path === '../fixture/foo') {
      assert(resolved.match(/test\/fixture\/foo.js$/), 'The path resolves correctly (1)');
      assert(requiredFromPath.match(/test\/integration\/test-require-path.js/))
    }
    else if (path === './bar') {
      assert(resolved.match(/test\/fixture\/bar.js$/), 'The path resolves correctly (2)');
      assert(requiredFromPath.match(/test\/fixture\/foo.js/))
    }

    return resolved;
  }
});
assert.strictEqual(requiredPaths.indexOf('../fixture/foo'), 0);
assert.strictEqual(requiredPaths.length, 2);
assert.strictEqual(requiredPaths[0], '../fixture/foo');
assert.strictEqual(requiredPaths[1], './bar');
assert.strictEqual(foo.foo, 'foo');
assert.strictEqual(foo.bar, 'bar');


requiredPaths = [];

var virtualFoo = SandboxedModule.require('idontexist', {
  resolvePath: function (path, resolve) {
    requiredPaths.push(path);
    return path === 'idontexist' ? resolve('../fixture/foo') : resolve(path);
  }
});
assert.strictEqual(requiredPaths.indexOf('idontexist'), 0);
assert.strictEqual(requiredPaths.length, 2);
assert.strictEqual(virtualFoo.foo, 'foo');
assert.strictEqual(virtualFoo.bar, 'bar');

//
// It can ignore modules
//
requiredPaths = [];
var ignored = SandboxedModule.require('idontexist', {
  resolvePath: function (path, resolve) {
    requiredPaths.push(path);
    return null;
  }
});
assert.strictEqual(requiredPaths.length, 1);
assert.strictEqual(Object.keys(ignored).length, 0);


//
// It can ignore submodules
//
requiredPaths = [];
var subIgnored = SandboxedModule.require('../fixture/foo', {
  resolvePath: function (path, resolve) {
    requiredPaths.push(path);
    return path === './bar' ? null : resolve(path);
  }
});
assert.strictEqual(requiredPaths.length, 2);
assert.strictEqual(Object.keys(subIgnored.bar).length, 0);


//
// It can ignore paths that normally don't make sense
//
requiredPaths = [];
var nonsense = SandboxedModule.require('../fixture/nonsense', {
  resolvePath: function (path, resolve) {
    requiredPaths.push(path);
    return path.match('^http://') ? null : resolve(path);
  }
});
assert.strictEqual(requiredPaths.length, 2);
assert.strictEqual(Object.keys(nonsense.result).length, 0);
