/* eslint-disable */
export default `diff --git a/event.ts b/event.ts
@@ -40,7 +40,7 @@ function mitt<Events extends Record<EventType, unknown>> (all?: EventHandlerMap<

         /**
          * Register an event handler for the given type.
-         * @param {string|symbol} type Type of event to listen for, or -'*'- for all events
+         * @param {string|symbol} type Type of event to listen for, or '*' for all events
          * @param {Function} handler Function to call in response to given event
          * @memberOf mitt
          */
@@ -56,7 +56,7 @@ function mitt<Events extends Record<EventType, unknown>> (all?: EventHandlerMap<
         /**
          * Remove an event handler for the given type.
          * If -handler- is omitted, all handlers of the given type are removed.
-         * @param {string|symbol} type Type of event to unregister -handler- from (-'*'- to remove a wildcard handler)
+         * @param {string|symbol} type Type of event to unregister handler from ('*' to remove a wildcard handler)
          * @param {Function} [handler] Handler function to remove
          * @memberOf mitt
          */
@@ -73,7 +73,7 @@ function mitt<Events extends Record<EventType, unknown>> (all?: EventHandlerMap<

         /**
          * Invoke all handlers for the given type.
-         * If present, -'*'- handlers are invoked after type-matched handlers.
+         * If present, '*' handlers are invoked after type-matched handlers.
          *
          * Note: Manually firing '*' handlers is not supported.
          *
@@ -100,3 +100,4 @@ function mitt<Events extends Record<EventType, unknown>> (all?: EventHandlerMap<
 }

 export default mitt
+

diff --git a/index.ts b/index.ts
new file mode 100644
--- /dev/null
+++ b/index.ts
@@ -0,0 +1,22 @@
+import * as Apis from './apis'
+import eventBus, { Emitter } from './event'
+import Http from './Http'
+import * as Plugin from './plugins'
+
+type Events = {
+    [propName: string]: {
+        data: unknown
+    }
+}
+
+const Bus: Emitter<Events> = eventBus<Events>()
+
+const widget = {
+    Apis,
+    Bus,
+    Http,
+    Plugin,
+}
+
+
+export default widget

`
