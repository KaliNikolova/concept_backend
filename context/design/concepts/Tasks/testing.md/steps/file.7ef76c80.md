---
timestamp: 'Mon Nov 03 2025 17:45:26 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251103_174526.620e35d7.md]]'
content_id: 7ef76c807fbcff31a2c829ba5b723c810cc704a0339a2f8c5fd65e34ef4c262d
---

# file: deno.json

```json
{
    "nodeModulesDir": "auto",
    "imports": {
        "@concepts/": "./src/concepts/",
        "@utils/": "./src/utils/",
        "bcrypt": "https://deno.land/x/bcrypt@v0.4.1/mod.ts"
    },
    "tasks": {
        "concepts": "deno run --allow-net --allow-read --allow-sys --allow-env src/concept_server.ts --port 8000 --baseUrl /api"
    },
    "lint": {
    "rules": {
      "exclude": ["no-import-prefix", "no-unversioned-import"]
    }
  }
}
```
