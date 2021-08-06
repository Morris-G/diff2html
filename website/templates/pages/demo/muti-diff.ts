/* eslint-disable */
export default `
diff --git a/src/frontend/devops-visual/.babelrc b/src/frontend/devops-visual/.babelrc
index cc1d5e745246dadb0de3c5e82a5df02b17900633..b4b0610aa01395919acc64eb00392b2638d70308 100644
--- a/src/frontend/devops-visual/.babelrc
+++ b/src/frontend/devops-visual/.babelrc
@@ -1,25 +1,43 @@
 {
     "presets": [
         [
-            "env",
+            "@babel/preset-env",
             {
                 "modules": "commonjs",
                 "targets": {
                     "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
                 },
                 "debug": false,
-                "useBuiltIns": true
+                "corejs": 2,
+                "useBuiltIns": "usage"
             }
         ],
-        "stage-2"
+        "@vue/babel-preset-jsx"
+    ],
+    "plugins": [
+        [
+            "@babel/plugin-transform-runtime",
+            {
+                "corejs": 2
+            }
+        ],
+        "@babel/plugin-transform-object-assign",
+        "@babel/plugin-syntax-dynamic-import",
+        [
+            "import-bk-magic-vue",
+            {
+                "baseLibName": "bk-magic-vue"
+            }
+        ],
+        "@babel/plugin-syntax-import-meta"
     ],
-    "plugins": ["transform-runtime","transform-vue-jsx", "transform-object-assign", "syntax-dynamic-import", "transform-class-properties", "transform-decorators-legacy",
-    ["import-bk-magic-vue", {
-            "baseLibName": "bk-magic-vue"
-        }]],
     "env": {
         "test": {
-            "presets": ["env", "stage-2"]
+            "presets": ["@babel/preset-env"],
+            "plugins": [
+                "@babel/plugin-syntax-dynamic-import",
+                "@babel/plugin-syntax-import-meta"
+            ]
         }
     }
 }
\ No newline at end of file
diff --git a/src/frontend/devops-visual/.eslintrc.js b/src/frontend/devops-visual/.eslintrc.js
index 51ad55d99d02c626001373b2dabf6702b022b066..9081f79b6701984fc4bec89cb89cfcc39e156535 100644
--- a/src/frontend/devops-visual/.eslintrc.js
+++ b/src/frontend/devops-visual/.eslintrc.js
@@ -10,7 +10,7 @@ 
module.exports = {
     ],
     parserOptions: {
         parser: 'babel-eslint',
-        ecmaVersion: 2018,
+        ecmaVersion: 2020,
         sourceType: 'module',
         ecmaFeatures: {
             jsx: true,
diff --git a/src/frontend/devops-visual/package.json b/src/frontend/devops-visual/package.json
index d215a19fe123b5405a7fda23e7cab30368933074..efca24540e6830773edbc3e9ed76ba0b77845950 100644
--- a/src/frontend/devops-visual/package.json
+++ b/src/frontend/devops-visual/package.json
@@ -5,15 +5,20 @@
   "dependencies": {
     "@antv/data-set": "^0.11.5",
     "@antv/g2": "^4.0.15",
+    "@babel/core": "^7.0.0",
+    "@babel/plugin-syntax-dynamic-import": "^7.0.0",
+    "@babel/plugin-syntax-import-meta": "^7.0.0",
+    "@babel/plugin-syntax-jsx": "^7.0.0",
+    "@babel/plugin-transform-object-assign": "^7.0.0",
+    "@babel/plugin-transform-runtime": "^7.0.0",
+    "@babel/preset-env": "^7.0.0",
+    "@babel/runtime-corejs2": "^7.14.6",
     "@toast-ui/vue-editor": "^2.1.1",
-    "babel-loader": "^7.1.4",
+    "@vue/babel-helper-vue-jsx-merge-props": "^1.2.1",
+    "@vue/babel-preset-jsx": "^1.2.4",
+    "babel-loader": "^8.2.2",
     "babel-plugin-istanbul": "^4.1.6",
-    "babel-plugin-syntax-dynamic-import": "^6.18.0",
-    "babel-plugin-syntax-jsx": "^6.18.0",
-    "babel-plugin-transform-object-assign": "^6.22.0",
-    "babel-plugin-transform-runtime": "^6.23.0",
-    "babel-preset-env": "^1.6.1",
-    "babel-preset-stage-2": "^6.24.1",
+    "core-js": "^2.6.12",
     "cross-env": "^5.1.4",
     "css-loader": "^0.28.11",
     "echarts": "4.0.2",
@@ -25,6 +30,7 @@
     "mini-css-extract-plugin": "^0.4.0",
     "node-sass": "^4.9.0",
     "sass-loader": "^7.0.1",
+    "sortablejs": "^1.13.0",
     "spark-md5": "^3.0.1",
     "style-loader": "^0.23.1",
     "svg-sprite-loader": "^4.1.6",
@@ -35,17 +41,16 @@
     "vue-property-decorator": "^6.0.0",
     "vue-simple-uploader": "^0.7.4",
     "vue-template-compiler": "^2.5.16",
+    "vxe-table": "^3.3.8",
     "wangeditor": "^3.1.1",
-    "webpack": "^4.8.1"
+    "webpack": "^4.8.1",
+    "xe-utils": "^3.3.0"
   },
   "devDependencies": {
+    "@babel/core": "^7.0.0",
     "@babel/helper-module-imports": "^7.0.0",
-    "babel-core": "^6.26.3",
     "babel-eslint": "~10.0.2",
     "babel-plugin-import-bk-magic-vue": "^2.0.10",
-    "babel-plugin-transform-class-properties": "^6.24.1",
-    "babel-plugin-transform-decorators-legacy": "^1.3.4",
-    "babel-plugin-transform-vue-jsx": "^3.7.0",
     "clean-webpack-plugin": "^3.0.0",
     "copy-webpack-plugin": "^5.1.1",
     "eslint": "^5.16.0",
`;
