# setup-wabt-action

This actions adds the [wabt](https://github.com/WebAssembly/wabt) binaries to PATH.

## Usage

```yaml
- name: Use wabt ${{ matrix.wabt-version }}
  uses: mwilliamson/setup-wabt-action@v1
  with:
    wabt-version: "1.0.20"
```
