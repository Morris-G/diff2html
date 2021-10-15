/* eslint-disable */
export default `
diff --git a/diff2html.html b/diff2html.html
index a0f551c..be73b03 100644
--- a/diff2html.html
+++ b/diff2html.html
@@ -39,7 +39,7 @@
     document.addEventListener('DOMContentLoaded', function () {
       var targetElement = document.getElementById('myDiffElement');
       var configuration = {
-        drawFileList: true,
+        drawFileList: false,
         fileListToggle: false,
         fileListStartVisible: false,
         fileContentToggle: false,
@@ -51,7 +51,7 @@
       };
       var diff2htmlUi = new Diff2HtmlUI(targetElement, diffString, configuration);
       diff2htmlUi.draw();
-      diff2htmlUi.highlightCode();
+      // diff2htmlUi.highlightCode();
     });
   </script>
   <body>

`;
