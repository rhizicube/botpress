## Overview

This example includes a lot of "boilerplate" to create a module with almost all features you can implement from the documentation
Please check the [official documentation](https://botpress.com/docs/developers/create-module/) for more information

## Quick Start

1. Copy the folder `examples/module-templates/whatsApp-integration` to `modules/whatsApp-integration`
2. Open a terminal in the folder `modules/whatsApp-integration` and type `yarn && yarn build`
3. Edit your `botpress.config.json` and add the module definition so it will be loaded:

```js
{
  ...
  "modules": [
    ...
    {
      "location": "MODULES_ROOT/whatsApp-integration",
      "enabled": true
    },
}
```

4. Start Botpress: `yarn start`
5. Choose any bots in your workspace, then you should see the module in the sidebar !

## Continuous Development

When you make changes to any portion of your module, you need to build it and restart Botpress.

You can type `yarn watch` which will save you some time, since every time you make a change, the source will be compiled immediately. You will only have to restart Botpress.
