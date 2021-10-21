/* eslint-disable */
export default `
diff --git a/svg-export/svgexport-100.png b/svg-export/svgexport-100.png
deleted file mode 100644
index 52fc2eb..0000000
--- a/svg-export/svgexport-100.png
+++ /dev/null
Binary files differ
diff --git a/imgs.jpg b/rename.jpg
similarity index 100%
rename from imgs.jpg
rename to rename.jpg
Binary files differ
diff --git a/src/frontend/bk-code/src/assets/fonts/iconfont.woff b/src/frontend/bk-code/src/assets/fonts/iconfont.woff
new file mode 100644
index 0000000000000000000000000000000000000000..ce65da24e1f2b4901ec77f60787e2aec772c9f02
Binary files /dev/null and b/src/frontend/bk-code/src/assets/fonts/iconfont.woff differ
diff --git a/src/frontend/bk-code/src/router/index.js b/src/frontend/bk-code/src/router/index.js
index e5d24947607b500f0f48c2ef0e13891c7642a536..e89ac6c88994376a3d1d14dd110c9b63b4fc3394 100644
--- a/src/frontend/bk-code/src/router/index.js
+++ b/src/frontend/bk-code/src/router/index.js
@@ -4 +4,24 @@ import routes from './router'
 
 Vue.use(VueRouter)
 
-const createRouter = (store) => {
+const createRouter = () => {
     const router = new VueRouter({
         mode: 'history',
         routes: routes
     })
+
+    router.beforeEach((to, from, next) => {
+        const { projectId, repoId } = from.params
+
+        if (to.params.projectId === undefined) {
+            to.params.projectId = projectId
+        }
+
+        if (to.params.repoId === undefined) {
+            to.params.repoId = repoId
+        }
+        next()
+    })
     
     return router
 }
diff --git a/src/frontend/bk-code/src/views/commit/detail/index.vue b/src/frontend/bk-code/src/views/commit/detail/index.vue
new file mode 100644
index 0000000000000000000000000000000000000000..16a87e441eacfcd99de4cea14178596acefefa5f
--- /dev/null
+++ b/src/frontend/bk-code/src/views/commit/detail/index.vue
@@ -0,0 +1,45 @@
+<template>
+    <div class="commit-detail">
+        <div class="detail-top">
+            <list-item
+                type="commit"
+                :is-file="true"
+                :list="commitDetail"
+                :show-default="false"
+                :show-branch-category="false"
+                :show-diff="false">
+            </list-item>
+        </div>
+        <div class="detail-btm">
+            <div class="detail-btm-left"></div>
+            <div class="detail btm-right">
+                <diff-2-html :diff-str="mutiDiff"></diff-2-html>
+            </div>
+        </div>
+        
+    </div>
+</template>
+
+<script>
+    import ListItem from '@/components/Common/ListItem'
+    import Diff2Html from '@/components/Diff2Html'
+    import mutiDiff from './muti-diff'
+
+    export default {
+        name: 'commit-list',
+        components: {
+            ListItem,
+            Diff2Html
+        },
+        data () {
+            return {
+                commitDetail: [],
+                mutiDiff
+            }
+        }
+    }
+</script>
+
+<style lang="scss" scoped>
+
+</style>
diff --git a/src/frontend/bk-code/src/plugins/diff2html/diff2html.min.css b/src/frontend/bk-code/src/plugins/diff2html/diff2html.min.css
deleted file mode 100644
index 7a7f4a069c469e93f28cf8b1f771c72b4a702033..0000000000000000000000000000000000000000
--- a/src/frontend/bk-code/src/plugins/diff2html/diff2html.min.css
+++ /dev/null
@@ -1,7 +0,0 @@
-/*!
-  Theme: Cupertino
-  Author: Defman21
-  License: ~ MIT (or more permissive) [via base16-schemes-source]
-  Maintainer: @highlightjs/core-team
-  Version: 2021.05.0
-*/pre code.hljs{display:block;overflow-x:auto;padding:1em}code.hljs{padding:3px 5px}.hljs{background:#fff;color:#404040}.hljs ::-moz-selection{color:silver}.hljs ::selection{color:silver}.hljs-comment,.hljs-tag{color:grey}.hljs-operator,.hljs-punctuation,.hljs-subst{color:#404040}.hljs-operator{opacity:.7}.hljs-bullet,.hljs-deletion,.hljs-name,.hljs-selector-tag,.hljs-template-variable,.hljs-variable{color:#c41a15}.hljs-attr,.hljs-link,.hljs-literal,.hljs-number,.hljs-symbol,.hljs-variable.constant_{color:#eb8500}.hljs-class .hljs-title,.hljs-strong,.hljs-title,.hljs-title.class_{color:#826b28}.hljs-strong{font-weight:700}.hljs-addition,.hljs-code,.hljs-string,.hljs-title.class_.inherited__{color:#007400}.hljs-built_in,.hljs-doctag,.hljs-keyword.hljs-atrule,.hljs-quote,.hljs-regexp{color:#318495}.hljs-attribute,.hljs-function .hljs-title,.hljs-section,.hljs-title.function_,.ruby .hljs-property{color:#00f}.diff .hljs-meta,.hljs-keyword,.hljs-template-tag,.hljs-type{color:#a90d91}.hljs-emphasis{color:#a90d91;font-style:italic}.hljs-meta,.hljs-meta .hljs-keyword,.hljs-meta .hljs-string{color:#826b28}.hljs-meta-keyword,.hljs-meta .hljs-keyword{font-weight:700}.d2h-d-none{display:none}.d2h-wrapper{text-align:left}.d2h-file-header{background-color:#fafafa;border-bottom:1px solid #e5e5e5;font-family:Source Sans Pro,Helvetica Neue,Helvetica,Arial,sans-serif;height:35px;padding:5px 10px}.d2h-file-header,.d2h-file-stats{display:-webkit-box;display:-ms-flexbox;display:flex}.d2h-file-stats{font-size:14px;margin-left:auto}.d2h-lines-added{border:1px solid #399839;border-radius:5px 0 0 5px;color:#168f48;text-align:right}.d2h-lines-added,.d2h-lines-deleted{line-height:18px;padding:2px 4px;vertical-align:middle}.d2h-lines-deleted{border:1px solid #fac5cd;border-radius:0 5px 5px 0;color:#db3b21;margin-left:1px;text-align:left}.d2h-file-name-wrapper{-webkit-box-align:center;-ms-flex-align:center;align-items:center;cursor:pointer;display:-webkit-box;display:-ms-flexbox;display:flex;font-size:15px;width:100%}.d2h-file-name{overflow-x:hidden;text-overflow:ellipsis;white-space:nowrap}.d2h-file-wrapper{border:1px solid #ddd;border-radius:5px;margin-bottom:1em;overflow:hidden}.d2h-file-collapse{-webkit-box-pack:end;-ms-flex-pack:end;-webkit-box-align:center;-ms-flex-align:center;align-items:center;border:1px solid #ddd;border-radius:3px;cursor:pointer;display:none;font-size:12px;justify-content:flex-end;padding:4px 8px}.d2h-file-collapse.d2h-selected{background-color:#c8e1ff}.d2h-file-collapse-input{margin:0 4px 0 0}.d2h-diff-table{border-collapse:collapse;font-family:Menlo,Consolas,monospace;font-size:13px;width:100%}.d2h-files-diff{display:block;width:100%}.d2h-file-diff{overflow-y:hidden}.d2h-file-side-diff{display:inline-block;margin-right:-4px;overflow-x:scroll;overflow-y:hidden;width:50%}.d2h-code-line{padding:0 8em}.d2h-code-line,.d2h-code-side-line{display:inline-block;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;white-space:nowrap;width:100%}.d2h-code-side-line{height:19px;line-height:19px;padding:0 4.5em}.d2h-info .d2h-code-side-line{height:auto}.d2h-code-line-ctn{word-wrap:normal;background:none;display:inline-block;padding:0;-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;vertical-align:middle;white-space:pre;width:100%}.d2h-code-line del,.d2h-code-side-line del{background-color:#fac5cd}.d2h-code-line del,.d2h-code-line ins,.d2h-code-side-line del,.d2h-code-side-line ins{border-radius:.2em;display:inline-block;margin-top:-1px;text-decoration:none;vertical-align:middle}.d2h-code-line ins,.d2h-code-side-line ins{background-color:#c7f0d2;text-align:left}.d2h-code-line-prefix{word-wrap:normal;background:none;display:inline;padding:0;white-space:pre}.line-num1{float:left}.line-num1,.line-num2{-webkit-box-sizing:border-box;box-sizing:border-box;overflow:hidden;padding:0 .5em;text-overflow:ellipsis;width:3.5em}.line-num2{float:right}.d2h-code-linenumber{background-color:#fff;border:solid #eee;border-width:0 1px;-webkit-box-sizing:border-box;box-sizing:border-box;color:rgba(0,0,0,.3);cursor:pointer;display:inline-block;position:absolute;text-align:right;width:7.5em}.d2h-code-linenumber.d2h-info{direction:ltr;display:-webkit-box;display:-ms-flexbox;display:flex}.d2h-code-side-linenumber .load-more{padding:0;width:100%}.load-more{padding:0 .5em;width:50%}.d2h-code-linenumber:hover,.d2h-code-side-linenumber:hover{color:rgba(0,0,0,.6)}.d2h-code-side-linenumber{background-color:#fff;border:solid #eee;border-width:0 1px 0 0;-webkit-box-sizing:border-box;box-sizing:border-box;color:rgba(0,0,0,.3);cursor:pointer;display:inline-block;overflow:hidden;padding:0 .5em;position:absolute;text-align:right;text-overflow:ellipsis;width:4em}.d2h-code-side-emptyplaceholder,.d2h-emptyplaceholder{background-color:#fafafa;border-color:#e1e1e1}.d2h-code-line-prefix,.d2h-code-linenumber,.d2h-code-side-linenumber,.d2h-emptyplaceholder{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.d2h-code-linenumber,.d2h-code-side-linenumber{direction:rtl;line-height:19px}.d2h-code-linenumber.d2h-info,.d2h-code-side-linenumber.d2h-info{background-color:#dbedff}.d2h-code-linenumber.d2h-del,.d2h-code-side-linenumber.d2h-del{background-color:#ffdce0}.d2h-code-linenumber.d2h-ins,.d2h-code-side-linenumber.d2h-ins{background-color:#ccffd8}.d2h-del{background-color:#fee8e9;border-color:#fac5cd}.d2h-ins{background-color:#ecfdf0;border-color:#c7f0d2}.d2h-info{background-color:#f1f8ff;border-color:#dbedff;color:rgba(27,31,35,.7);height:19px;line-height:1}.d2h-file-diff .d2h-del.d2h-change{background-color:#fdf2d0}.d2h-file-diff .d2h-ins.d2h-change{background-color:#ded}.d2h-file-list-wrapper{margin-bottom:10px}.d2h-file-list-wrapper a{color:#3572b0;text-decoration:none}.d2h-file-list-wrapper a:visited{color:#3572b0}.d2h-file-list-header{text-align:left}.d2h-file-list-title{font-weight:700}.d2h-file-list-line{display:-webkit-box;display:-ms-flexbox;display:flex;text-align:left}.d2h-file-list{display:block;list-style:none;margin:0;padding:0}.d2h-file-list>li{border-bottom:1px solid #ddd;margin:0;padding:5px 10px}.d2h-file-list>li:last-child{border-bottom:none}.d2h-file-switch{cursor:pointer;display:none;font-size:10px}.d2h-icon{fill:currentColor;cursor:pointer;margin-right:10px;vertical-align:middle}.d2h-icon.collapse-icon{-webkit-transition:-webkit-transform .3s linear;transition:-webkit-transform .3s linear;transition:transform .3s linear;transition:transform .3s linear,-webkit-transform .3s linear}.d2h-file-header.uncollapse .d2h-icon.collapse-icon{-webkit-transform:rotate(-90deg);transform:rotate(-90deg)}.d2h-file-header.uncollapse+.d2h-file-diff,.d2h-file-header.uncollapse+.d2h-files-diff{display:none}.d2h-deleted{color:#db3b21}.d2h-added{color:#168f48}.d2h-changed{color:#d0b44c}.d2h-moved{color:#3572b0}.d2h-tag{background-color:#fff;display:-webkit-box;display:-ms-flexbox;display:flex;font-size:10px;margin-left:5px;padding:0 2px}.d2h-deleted-tag{border:1px solid #db3b21}.d2h-added-tag{border:1px solid #168f48}.d2h-changed-tag{border:1px solid #d0b44c}.d2h-moved-tag{border:1px solid #3572b0}span.tool-bar{line-height:24px;padding:2px 0}svg.tool-bar-icon{cursor:pointer;height:20px;margin-right:5px;width:20px}span.line-comment-btn{background:-webkit-gradient(linear,left top,left bottom,from(#0472f1),to(#0366d6));background:linear-gradient(#0472f1,#0366d6);border:1px solid transparent;border-radius:16px;color:#fff;cursor:pointer;display:inline-block;height:16px;line-height:14px;margin-left:-4px;margin-top:1px;opacity:0;position:absolute;text-align:center;width:16px}span.line-comment-btn:hover{-webkit-transform:scale(1.2);transform:scale(1.2)}.d2h-code-line:hover span.line-comment-btn,.d2h-code-side-line:hover span.line-comment-btn{opacity:1}.code-line-selected td.d2h-code-side-linenumber{background-color:#c6cced;border-width:0}.code-line-selected td.d2h-code-side-linenumber+td{background-color:#c6cced}
\ No newline at end of file
diff --git a/src/frontend/bk-code/src/views/commit/detail/muti-diff.js b/src/frontend/bk-code/src/views/commit/detail/muti-diff.js
new file mode 100644
index 0000000000000000000000000000000000000000..481326dfeec153656051b8f598da37d1bb265749
--- /dev/null
+++ b/src/frontend/bk-code/src/views/commit/detail/muti-diff.js
@@ -0,0 +1,148 @@
+export default 
+diff --git a/sample/index.xml b/sample/index.xml
+index 693457a..2d658a1 100644
+--- a/sample/index.xml
++++ b/sample/index.xml
+@@ -16,6 +16,8 @@
+     <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.1.0/highlight.min.js"></script>
+     <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.1.0/languages/scala.min.js"></script>
+ 
++    <script src="https://cdnjs.cloudflare.com/ajax/libs/hogan.js/3.0.2/hogan.min.js"></script>
++
+     <!-- diff2html -->
+     <link rel="stylesheet" type="text/css" href="../dist/diff2html.css">
+     <script type="text/javascript" src="../dist/diff2html-templates.js"></script>
+diff --git a/src/frontend/devops-visual/.babelrc b/src/frontend/devops-visual/.babelrc
+index cc1d5e745246dadb0de3c5e82a5df02b17900633..b4b0610aa01395919acc64eb00392b2638d70308 100644
+--- a/src/frontend/devops-visual/.babelrc
++++ b/src/frontend/devops-visual/.babelrc
+@@ -1,25 +1,43 @@
+ {
+     "presets": [
+         [
+-            "env",
++            "@babel/preset-env",
+             {
+                 "modules": "commonjs",
+                 "targets": {
+                     "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
+                 },
+                 "debug": false,
+-                "useBuiltIns": true
++                "corejs": 2,
++                "useBuiltIns": "usage"
+             }
+         ],
+-        "stage-2"
++        "@vue/babel-preset-jsx"
++    ],
++    "plugins": [
++        [
++            "@babel/plugin-transform-runtime",
++            {
++                "corejs": 2
++            }
++        ],
++        "@babel/plugin-transform-object-assign",
++        "@babel/plugin-syntax-dynamic-import",
++        [
++            "import-bk-magic-vue",
++            {
++                "baseLibName": "bk-magic-vue"
++            }
++        ],
++        "@babel/plugin-syntax-import-meta"
+     ],
+-    "plugins": ["transform-runtime","transform-vue-jsx", "transform-object-assign", "syntax-dynamic-import", "transform-class-properties", "transform-decorators-legacy",
+-    ["import-bk-magic-vue", {
+-            "baseLibName": "bk-magic-vue"
+-        }]],
+     "env": {
+         "test": {
+-            "presets": ["env", "stage-2"]
++            "presets": ["@babel/preset-env"],
++            "plugins": [
++                "@babel/plugin-syntax-dynamic-import",
++                "@babel/plugin-syntax-import-meta"
++            ]
+         }
+     }
+ }
\ No newline at end of file
+diff --git a/src/frontend/devops-visual/.eslintrc.js b/src/frontend/devops-visual/.eslintrc.js
+index 51ad55d99d02c626001373b2dabf6702b022b066..9081f79b6701984fc4bec89cb89cfcc39e156535 100644
+--- a/src/frontend/devops-visual/.eslintrc.js
++++ b/src/frontend/devops-visual/.eslintrc.js
+@@ -10,7 +10,7 @@ 
+module.exports = {
+     ],
+     parserOptions: {
+         parser: 'babel-eslint',
+-        ecmaVersion: 2018,
++        ecmaVersion: 2020,
+         sourceType: 'module',
+         ecmaFeatures: {
+             jsx: true,
+diff --git a/src/frontend/devops-visual/package.json b/src/frontend/devops-visual/package.json
+index d215a19fe123b5405a7fda23e7cab30368933074..efca24540e6830773edbc3e9ed76ba0b77845950 100644
+--- a/src/frontend/devops-visual/package.json
++++ b/src/frontend/devops-visual/package.json
+@@ -5,15 +5,20 @@
+   "dependencies": {
+     "@antv/data-set": "^0.11.5",
+     "@antv/g2": "^4.0.15",
++    "@babel/core": "^7.0.0",
++    "@babel/plugin-syntax-dynamic-import": "^7.0.0",
++    "@babel/plugin-syntax-import-meta": "^7.0.0",
++    "@babel/plugin-syntax-jsx": "^7.0.0",
++    "@babel/plugin-transform-object-assign": "^7.0.0",
++    "@babel/plugin-transform-runtime": "^7.0.0",
++    "@babel/preset-env": "^7.0.0",
++    "@babel/runtime-corejs2": "^7.14.6",
+     "@toast-ui/vue-editor": "^2.1.1",
+-    "babel-loader": "^7.1.4",
++    "@vue/babel-helper-vue-jsx-merge-props": "^1.2.1",
++    "@vue/babel-preset-jsx": "^1.2.4",
++    "babel-loader": "^8.2.2",
+     "babel-plugin-istanbul": "^4.1.6",
+-    "babel-plugin-syntax-dynamic-import": "^6.18.0",
+-    "babel-plugin-syntax-jsx": "^6.18.0",
+-    "babel-plugin-transform-object-assign": "^6.22.0",
+-    "babel-plugin-transform-runtime": "^6.23.0",
+-    "babel-preset-env": "^1.6.1",
+-    "babel-preset-stage-2": "^6.24.1",
++    "core-js": "^2.6.12",
+     "cross-env": "^5.1.4",
+     "css-loader": "^0.28.11",
+     "echarts": "4.0.2",
+@@ -25,6 +30,7 @@
+     "mini-css-extract-plugin": "^0.4.0",
+     "node-sass": "^4.9.0",
+     "sass-loader": "^7.0.1",
++    "sortablejs": "^1.13.0",
+     "spark-md5": "^3.0.1",
+     "style-loader": "^0.23.1",
+     "svg-sprite-loader": "^4.1.6",
+@@ -35,17 +41,16 @@
+     "vue-property-decorator": "^6.0.0",
+     "vue-simple-uploader": "^0.7.4",
+     "vue-template-compiler": "^2.5.16",
++    "vxe-table": "^3.3.8",
+     "wangeditor": "^3.1.1",
+-    "webpack": "^4.8.1"
++    "webpack": "^4.8.1",
++    "xe-utils": "^3.3.0"
+   },
+   "devDependencies": {
++    "@babel/core": "^7.0.0",
+     "@babel/helper-module-imports": "^7.0.0",
+-    "babel-core": "^6.26.3",
+     "babel-eslint": "~10.0.2",
+     "babel-plugin-import-bk-magic-vue": "^2.0.10",
+-    "babel-plugin-transform-class-properties": "^6.24.1",
+-    "babel-plugin-transform-decorators-legacy": "^1.3.4",
+-    "babel-plugin-transform-vue-jsx": "^3.7.0",
+     "clean-webpack-plugin": "^3.0.0",
+     "copy-webpack-plugin": "^5.1.1",
+     "eslint": "^5.16.0",
+
diff --git a/src/frontend/bk-code/src/views/commit/index.vue b/src/frontend/bk-code/src/views/commit/list/index.vue
similarity index 100%
rename from src/frontend/bk-code/src/views/commit/index.vue
rename to src/frontend/bk-code/src/views/commit/list/index.vue`
