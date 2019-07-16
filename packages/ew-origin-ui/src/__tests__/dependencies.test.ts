import packageJSON from '../../package.json';

// from https://docs.npmjs.com/files/package.json#dependencies
const nonExactPrefixes = ['~', '^', '>', '>=', '<', '<='];

describe('package.json', () => {
  it('dependencies should not contain any non-exact versions', () => {
    if (!packageJSON.dependencies) {
      return;
    }

    const deps = Object.values(packageJSON.dependencies);
    deps.forEach(depVersion => {
      nonExactPrefixes.forEach(badPrefix => {
        expect(depVersion.includes(badPrefix)).toBeFalsy();
      });
    });
  });

  it('devDependencies should not contain any non-exact versions', () => {
    const deps = packageJSON.devDependencies as any;

    for (let depName in deps) {
        const depVersion = deps[depName];

        nonExactPrefixes.forEach(badPrefix => {
            try {
                expect(depVersion.includes(badPrefix)).toBeFalsy();
            } catch (error) {
                throw new Error(`DevDependency ${depName} uses non-exact version: "${depVersion}"`);
            }
        });
    }
  });
});
