import {
  require_prop_types
} from "./chunk-R2LMYVXF.js";
import "./chunk-Q6DFBYTI.js";
import {
  require_react
} from "./chunk-TWJRYSII.js";
import {
  __toESM
} from "./chunk-DC5AMYBS.js";

// node_modules/@ckeditor/ckeditor5-react/dist/index.js
var import_react = __toESM(require_react());
var import_prop_types = __toESM(require_prop_types());

// node_modules/@ckeditor/ckeditor5-integrations-common/dist/index.js
function createDefer() {
  const deferred = {
    resolve: null,
    promise: null
  };
  deferred.promise = new Promise((resolve) => {
    deferred.resolve = resolve;
  });
  return deferred;
}
function waitFor(callback, {
  timeOutAfter = 500,
  retryAfter = 100
} = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let lastError = null;
    const timeoutTimerId = setTimeout(() => {
      reject(lastError ?? new Error("Timeout"));
    }, timeOutAfter);
    const tick = async () => {
      try {
        const result = await callback();
        clearTimeout(timeoutTimerId);
        resolve(result);
      } catch (err) {
        lastError = err;
        if (Date.now() - startTime > timeOutAfter) {
          reject(err);
        } else {
          setTimeout(tick, retryAfter);
        }
      }
    };
    tick();
  });
}
var INJECTED_SCRIPTS = /* @__PURE__ */ new Map();
function injectScript(src, { attributes } = {}) {
  if (INJECTED_SCRIPTS.has(src)) {
    return INJECTED_SCRIPTS.get(src);
  }
  const maybePrevScript = document.querySelector(`script[src="${src}"]`);
  if (maybePrevScript) {
    console.warn(`Script with "${src}" src is already present in DOM!`);
    maybePrevScript.remove();
  }
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.onerror = reject;
    script.onload = () => {
      resolve();
    };
    for (const [key, value] of Object.entries(attributes || {})) {
      script.setAttribute(key, value);
    }
    script.setAttribute("data-injected-by", "ckeditor-integration");
    script.type = "text/javascript";
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
    const observer = new MutationObserver((mutations) => {
      const removedNodes = mutations.flatMap((mutation) => Array.from(mutation.removedNodes));
      if (removedNodes.includes(script)) {
        INJECTED_SCRIPTS.delete(src);
        observer.disconnect();
      }
    });
    observer.observe(document.head, {
      childList: true,
      subtree: true
    });
  });
  INJECTED_SCRIPTS.set(src, promise);
  return promise;
}
async function injectScriptsInParallel(sources, props) {
  await Promise.all(
    sources.map((src) => injectScript(src, props))
  );
}
var INJECTED_STYLESHEETS = /* @__PURE__ */ new Map();
function injectStylesheet({
  href,
  placementInHead = "start",
  attributes = {}
}) {
  if (INJECTED_STYLESHEETS.has(href)) {
    return INJECTED_STYLESHEETS.get(href);
  }
  const maybePrevStylesheet = document.querySelector(`link[href="${href}"][rel="stylesheet"]`);
  if (maybePrevStylesheet) {
    console.warn(`Stylesheet with "${href}" href is already present in DOM!`);
    maybePrevStylesheet.remove();
  }
  const appendLinkTagToHead = (link) => {
    const previouslyInjectedLinks = Array.from(
      document.head.querySelectorAll('link[data-injected-by="ckeditor-integration"]')
    );
    switch (placementInHead) {
      case "start":
        if (previouslyInjectedLinks.length) {
          previouslyInjectedLinks.slice(-1)[0].after(link);
        } else {
          document.head.insertBefore(link, document.head.firstChild);
        }
        break;
      case "end":
        document.head.appendChild(link);
        break;
    }
  };
  const promise = new Promise((resolve, reject) => {
    const link = document.createElement("link");
    for (const [key, value] of Object.entries(attributes || {})) {
      link.setAttribute(key, value);
    }
    link.setAttribute("data-injected-by", "ckeditor-integration");
    link.rel = "stylesheet";
    link.href = href;
    link.onerror = reject;
    link.onload = () => {
      resolve();
    };
    appendLinkTagToHead(link);
    const observer = new MutationObserver((mutations) => {
      const removedNodes = mutations.flatMap((mutation) => Array.from(mutation.removedNodes));
      if (removedNodes.includes(link)) {
        INJECTED_STYLESHEETS.delete(href);
        observer.disconnect();
      }
    });
    observer.observe(document.head, {
      childList: true,
      subtree: true
    });
  });
  INJECTED_STYLESHEETS.set(href, promise);
  return promise;
}
function isSSR() {
  return typeof window === "undefined";
}
function once(fn) {
  let lastResult = null;
  return (...args) => {
    if (!lastResult) {
      lastResult = {
        current: fn(...args)
      };
    }
    return lastResult.current;
  };
}
function overwriteArray(source, destination) {
  destination.length = 0;
  destination.push(...source);
  return destination;
}
function overwriteObject(source, destination) {
  for (const prop of Object.getOwnPropertyNames(destination)) {
    delete destination[prop];
  }
  for (const [key, value] of Object.entries(source)) {
    if (value !== destination && key !== "prototype" && key !== "__proto__") {
      destination[key] = value;
    }
  }
  return destination;
}
function preloadResource(url, { attributes } = {}) {
  if (document.head.querySelector(`link[href="${url}"][rel="preload"]`)) {
    return;
  }
  const link = document.createElement("link");
  for (const [key, value] of Object.entries(attributes || {})) {
    link.setAttribute(key, value);
  }
  link.setAttribute("data-injected-by", "ckeditor-integration");
  link.rel = "preload";
  link.as = detectTypeOfResource(url);
  link.href = url;
  document.head.insertBefore(link, document.head.firstChild);
}
function detectTypeOfResource(url) {
  switch (true) {
    case /\.css$/.test(url):
      return "style";
    case /\.js$/.test(url):
      return "script";
    default:
      return "fetch";
  }
}
function shallowCompareArrays(a, b) {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
var HEX_NUMBERS = new Array(256).fill("").map((_, index) => ("0" + index.toString(16)).slice(-2));
function uid() {
  const [r1, r2, r3, r4] = crypto.getRandomValues(new Uint32Array(4));
  return "e" + HEX_NUMBERS[r1 >> 0 & 255] + HEX_NUMBERS[r1 >> 8 & 255] + HEX_NUMBERS[r1 >> 16 & 255] + HEX_NUMBERS[r1 >> 24 & 255] + HEX_NUMBERS[r2 >> 0 & 255] + HEX_NUMBERS[r2 >> 8 & 255] + HEX_NUMBERS[r2 >> 16 & 255] + HEX_NUMBERS[r2 >> 24 & 255] + HEX_NUMBERS[r3 >> 0 & 255] + HEX_NUMBERS[r3 >> 8 & 255] + HEX_NUMBERS[r3 >> 16 & 255] + HEX_NUMBERS[r3 >> 24 & 255] + HEX_NUMBERS[r4 >> 0 & 255] + HEX_NUMBERS[r4 >> 8 & 255] + HEX_NUMBERS[r4 >> 16 & 255] + HEX_NUMBERS[r4 >> 24 & 255];
}
function uniq(source) {
  return Array.from(new Set(source));
}
async function waitForWindowEntry(entryNames, config) {
  const tryPickBundle = () => entryNames.map((name) => window[name]).filter(Boolean)[0];
  return waitFor(
    () => {
      const result = tryPickBundle();
      if (!result) {
        throw new Error(`Window entry "${entryNames.join(",")}" not found.`);
      }
      return result;
    },
    config
  );
}
function filterObjectValues(obj, filter) {
  const filteredEntries = Object.entries(obj).filter(([key, value]) => filter(value, key));
  return Object.fromEntries(filteredEntries);
}
function filterBlankObjectValues(obj) {
  return filterObjectValues(
    obj,
    (value) => value !== null && value !== void 0
  );
}
function mapObjectValues(obj, mapper) {
  const mappedEntries = Object.entries(obj).map(([key, value]) => [key, mapper(value, key)]);
  return Object.fromEntries(mappedEntries);
}
function without(itemsToRemove, items) {
  return items.filter((item) => !itemsToRemove.includes(item));
}
function isSemanticVersion(version) {
  return !!version && /^\d+\.\d+\.\d+/.test(version);
}
function isCKCdnTestingVersion(version) {
  if (!version) {
    return false;
  }
  return ["nightly", "alpha", "internal"].some((testVersion) => version.includes(testVersion));
}
function isCKCdnVersion(version) {
  return isSemanticVersion(version) || isCKCdnTestingVersion(version);
}
function destructureSemanticVersion(version) {
  if (!isSemanticVersion(version)) {
    throw new Error(`Invalid semantic version: ${version || "<blank>"}.`);
  }
  const [major, minor, patch] = version.split(".");
  return {
    major: Number.parseInt(major, 10),
    minor: Number.parseInt(minor, 10),
    patch: Number.parseInt(patch, 10)
  };
}
function getLicenseVersionFromEditorVersion(version) {
  if (isCKCdnTestingVersion(version)) {
    return 3;
  }
  const { major } = destructureSemanticVersion(version);
  switch (true) {
    case major >= 44:
      return 3;
    case major >= 38:
      return 2;
    default:
      return 1;
  }
}
function getCKBaseBundleInstallationInfo() {
  const { CKEDITOR_VERSION, CKEDITOR } = window;
  if (!isCKCdnVersion(CKEDITOR_VERSION)) {
    return null;
  }
  return {
    source: CKEDITOR ? "cdn" : "npm",
    version: CKEDITOR_VERSION
  };
}
var CK_CDN_URL = "https://cdn.ckeditor.com";
function createCKCdnUrl(bundle, file, version) {
  return `${CK_CDN_URL}/${bundle}/${version}/${file}`;
}
var CKBOX_CDN_URL = "https://cdn.ckbox.io";
function createCKBoxCdnUrl(bundle, file, version) {
  return `${CKBOX_CDN_URL}/${bundle}/${version}/${file}`;
}
var CK_DOCS_URL = "https://ckeditor.com/docs/ckeditor5";
function createCKDocsUrl(path, version = "latest") {
  return `${CK_DOCS_URL}/${version}/${path}`;
}
function createCKCdnBaseBundlePack({
  version,
  translations,
  createCustomCdnUrl = createCKCdnUrl
}) {
  const urls = {
    scripts: [
      // Load the main script of the base features.
      createCustomCdnUrl("ckeditor5", "ckeditor5.umd.js", version),
      // Load all JavaScript files from the base features.
      // EN bundle is prebuilt into the main script, so we don't need to load it separately.
      ...without(["en"], translations || []).map(
        (translation) => createCustomCdnUrl("ckeditor5", `translations/${translation}.umd.js`, version)
      )
    ],
    stylesheets: [
      createCustomCdnUrl("ckeditor5", "ckeditor5.css", version)
    ]
  };
  return {
    // Preload resources specified in the pack, before loading the main script.
    preload: [
      ...urls.stylesheets,
      ...urls.scripts
    ],
    scripts: [
      // It's safe to load translations and the main script in parallel.
      async (attributes) => injectScriptsInParallel(urls.scripts, attributes)
    ],
    // Load all stylesheets of the base features.
    stylesheets: urls.stylesheets,
    // Pick the exported global variables from the window object.
    checkPluginLoaded: async () => waitForWindowEntry(["CKEDITOR"]),
    // Check if the CKEditor base bundle is already loaded and throw an error if it is.
    beforeInject: () => {
      const installationInfo = getCKBaseBundleInstallationInfo();
      switch (installationInfo == null ? void 0 : installationInfo.source) {
        case "npm":
          throw new Error(
            "CKEditor 5 is already loaded from npm. Check the migration guide for more details: " + createCKDocsUrl("updating/migration-to-cdn/vanilla-js.html")
          );
        case "cdn":
          if (installationInfo.version !== version) {
            throw new Error(
              `CKEditor 5 is already loaded from CDN in version ${installationInfo.version}. Remove the old <script> and <link> tags loading CKEditor 5 to allow loading the ${version} version.`
            );
          }
          break;
      }
    }
  };
}
function createCKCdnPremiumBundlePack({
  version,
  translations,
  createCustomCdnUrl = createCKCdnUrl
}) {
  const urls = {
    scripts: [
      // Load the main script of the premium features.
      createCustomCdnUrl("ckeditor5-premium-features", "ckeditor5-premium-features.umd.js", version),
      // Load all JavaScript files from the premium features.
      // EN bundle is prebuilt into the main script, so we don't need to load it separately.
      ...without(["en"], translations || []).map(
        (translation) => createCustomCdnUrl("ckeditor5-premium-features", `translations/${translation}.umd.js`, version)
      )
    ],
    stylesheets: [
      createCustomCdnUrl("ckeditor5-premium-features", "ckeditor5-premium-features.css", version)
    ]
  };
  return {
    // Preload resources specified in the pack, before loading the main script.
    preload: [
      ...urls.stylesheets,
      ...urls.scripts
    ],
    scripts: [
      // It's safe to load translations and the main script in parallel.
      async (attributes) => injectScriptsInParallel(urls.scripts, attributes)
    ],
    // Load all stylesheets of the premium features.
    stylesheets: urls.stylesheets,
    // Pick the exported global variables from the window object.
    checkPluginLoaded: async () => waitForWindowEntry(["CKEDITOR_PREMIUM_FEATURES"])
  };
}
async function loadCKCdnResourcesPack(pack) {
  let {
    htmlAttributes = {},
    scripts = [],
    stylesheets = [],
    preload,
    beforeInject,
    checkPluginLoaded
  } = normalizeCKCdnResourcesPack(pack);
  beforeInject == null ? void 0 : beforeInject();
  if (!preload) {
    preload = uniq([
      ...stylesheets.filter((item) => typeof item === "string"),
      ...scripts.filter((item) => typeof item === "string")
    ]);
  }
  for (const url of preload) {
    preloadResource(url, {
      attributes: htmlAttributes
    });
  }
  await Promise.all(
    uniq(stylesheets).map((href) => injectStylesheet({
      href,
      attributes: htmlAttributes,
      placementInHead: "start"
    }))
  );
  for (const script of uniq(scripts)) {
    const injectorProps = {
      attributes: htmlAttributes
    };
    if (typeof script === "string") {
      await injectScript(script, injectorProps);
    } else {
      await script(injectorProps);
    }
  }
  return checkPluginLoaded == null ? void 0 : checkPluginLoaded();
}
function normalizeCKCdnResourcesPack(pack) {
  if (Array.isArray(pack)) {
    return {
      scripts: pack.filter(
        (item) => typeof item === "function" || item.endsWith(".js")
      ),
      stylesheets: pack.filter(
        (item) => item.endsWith(".css")
      )
    };
  }
  if (typeof pack === "function") {
    return {
      checkPluginLoaded: pack
    };
  }
  return pack;
}
function combineCKCdnBundlesPacks(packs) {
  const normalizedPacks = mapObjectValues(
    filterBlankObjectValues(packs),
    normalizeCKCdnResourcesPack
  );
  const mergedPacks = Object.values(normalizedPacks).reduce(
    (acc, pack) => {
      acc.scripts.push(...pack.scripts ?? []);
      acc.stylesheets.push(...pack.stylesheets ?? []);
      acc.preload.push(...pack.preload ?? []);
      return acc;
    },
    {
      preload: [],
      scripts: [],
      stylesheets: []
    }
  );
  const checkPluginLoaded = async () => {
    var _a;
    const exportedGlobalVariables = /* @__PURE__ */ Object.create(null);
    for (const [name, pack] of Object.entries(normalizedPacks)) {
      exportedGlobalVariables[name] = await ((_a = pack == null ? void 0 : pack.checkPluginLoaded) == null ? void 0 : _a.call(pack));
    }
    return exportedGlobalVariables;
  };
  const beforeInject = () => {
    var _a;
    for (const pack of Object.values(normalizedPacks)) {
      (_a = pack.beforeInject) == null ? void 0 : _a.call(pack);
    }
  };
  return {
    ...mergedPacks,
    beforeInject,
    checkPluginLoaded
  };
}
function getCKBoxInstallationInfo() {
  var _a;
  const version = (_a = window.CKBox) == null ? void 0 : _a.version;
  if (!isSemanticVersion(version)) {
    return null;
  }
  return {
    source: "cdn",
    version
  };
}
function createCKBoxBundlePack({
  version,
  theme = "lark",
  translations,
  createCustomCdnUrl = createCKBoxCdnUrl
}) {
  return {
    // Load the main script of the base features.
    scripts: [
      createCustomCdnUrl("ckbox", "ckbox.js", version),
      // EN bundle is prebuilt into the main script, so we don't need to load it separately.
      ...without(["en"], translations || []).map(
        (translation) => createCustomCdnUrl("ckbox", `translations/${translation}.js`, version)
      )
    ],
    // Load optional theme, if provided. It's not required but recommended because it improves the look and feel.
    ...theme && {
      stylesheets: [
        createCustomCdnUrl("ckbox", `styles/themes/${theme}.css`, version)
      ]
    },
    // Pick the exported global variables from the window object.
    checkPluginLoaded: async () => waitForWindowEntry(["CKBox"]),
    // Check if the CKBox bundle is already loaded and throw an error if it is.
    beforeInject: () => {
      const installationInfo = getCKBoxInstallationInfo();
      if (installationInfo && installationInfo.version !== version) {
        throw new Error(
          `CKBox is already loaded from CDN in version ${installationInfo.version}. Remove the old <script> and <link> tags loading CKBox to allow loading the ${version} version.`
        );
      }
    }
  };
}
function isCKCdnSupportedByEditorVersion(version) {
  if (isCKCdnTestingVersion(version)) {
    return true;
  }
  const { major } = destructureSemanticVersion(version);
  const licenseVersion = getLicenseVersionFromEditorVersion(version);
  switch (licenseVersion) {
    case 3:
      return true;
    default:
      return major === 43;
  }
}
function combineCdnPluginsPacks(pluginsPacks) {
  const normalizedPluginsPacks = mapObjectValues(pluginsPacks, (pluginPack, pluginName) => {
    if (!pluginPack) {
      return void 0;
    }
    const normalizedPluginPack = normalizeCKCdnResourcesPack(pluginPack);
    return {
      // Provide default window accessor object if the plugin pack does not define it.
      checkPluginLoaded: async () => waitForWindowEntry([pluginName]),
      // Transform the plugin pack to a normalized advanced pack.
      ...normalizedPluginPack
    };
  });
  return combineCKCdnBundlesPacks(
    normalizedPluginsPacks
  );
}
function loadCKEditorCloud(config) {
  const {
    version,
    translations,
    plugins,
    premium,
    ckbox,
    createCustomCdnUrl,
    injectedHtmlElementsAttributes = {
      crossorigin: "anonymous"
    }
  } = config;
  validateCKEditorVersion(version);
  const pack = combineCKCdnBundlesPacks({
    CKEditor: createCKCdnBaseBundlePack({
      version,
      translations,
      createCustomCdnUrl
    }),
    ...premium && {
      CKEditorPremiumFeatures: createCKCdnPremiumBundlePack({
        version,
        translations,
        createCustomCdnUrl
      })
    },
    ...ckbox && {
      CKBox: createCKBoxBundlePack(ckbox)
    },
    loadedPlugins: combineCdnPluginsPacks(plugins ?? {})
  });
  return loadCKCdnResourcesPack(
    {
      ...pack,
      htmlAttributes: injectedHtmlElementsAttributes
    }
  );
}
function validateCKEditorVersion(version) {
  if (isCKCdnTestingVersion(version)) {
    console.warn(
      "You are using a testing version of CKEditor 5. Please remember that it is not suitable for production environments."
    );
  }
  if (!isCKCdnSupportedByEditorVersion(version)) {
    throw new Error(
      `The CKEditor 5 CDN can't be used with the given editor version: ${version}. Please make sure you are using at least the CKEditor 5 version 44.`
    );
  }
}

// node_modules/@ckeditor/ckeditor5-react/dist/index.js
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var _LifeCycleElementSemaphore = class _LifeCycleElementSemaphore2 {
  constructor(element, lifecycle) {
    __publicField(this, "_lifecycle");
    __publicField(this, "_element");
    __publicField(this, "_releaseLock", null);
    __publicField(this, "_value", null);
    __publicField(this, "_afterMountCallbacks", []);
    __publicField(this, "_state", {
      destroyedBeforeInitialization: false,
      mountingInProgress: null
    });
    __publicField(this, "release", once(() => {
      const { _releaseLock, _state, _element, _lifecycle } = this;
      if (_state.mountingInProgress) {
        _state.mountingInProgress.then(() => _lifecycle.unmount({
          element: _element,
          // Mount result might be overridden by watchdog during restart so use instance variable.
          mountResult: this.value
        })).catch((error) => {
          console.error("Semaphore unmounting error:", error);
        }).then(_releaseLock.resolve).then(() => {
          this._value = null;
        });
      } else {
        _state.destroyedBeforeInitialization = true;
        _releaseLock.resolve();
      }
    }));
    this._element = element;
    this._lifecycle = lifecycle;
    this._lock();
  }
  /**
   * Getter for {@link #_value}.
   */
  get value() {
    return this._value;
  }
  /**
   * Occasionally, the Watchdog restarts the editor instance, resulting in a new instance being assigned to the semaphore.
   * In terms of race conditions, it's generally safer to simply override the semaphore value rather than recreating it
   * with a different one.
   */
  unsafeSetValue(value) {
    this._value = value;
    this._afterMountCallbacks.forEach((callback) => callback(value));
    this._afterMountCallbacks = [];
  }
  /**
   * This registers a callback that will be triggered after the editor has been successfully mounted.
   *
   * 	* If the editor is already mounted, the callback will be executed immediately.
   *	* If the editor is in the process of mounting, the callback will be executed upon successful mounting.
  * 	* If the editor is never mounted, the passed callback will not be executed.
  * 	* If an exception is thrown within the callback, it will be re-thrown in the semaphore.
  */
  runAfterMount(callback) {
    const { _value, _afterMountCallbacks } = this;
    if (_value) {
      callback(_value);
    } else {
      _afterMountCallbacks.push(callback);
    }
  }
  /**
   * This method is used to inform other components that the {@link #_element} will be used by the editor,
   * which is initialized by the {@link #_lifecycle} methods.
   *
   * 	* If an editor is already present on the provided element, the initialization of the current one
   * 	  will be postponed until the previous one is destroyed.
   *
   * 	* If the element is empty and does not have an editor attached to it, the currently locked editor will
   * 	  be mounted immediately.
   *
   * After the successful initialization of the editor and the assignment of the {@link #_value} member,
   * the `onReady` lifecycle method is called.
   *
   * *Important note:*
   *
   * It’s really important to keep this method *sync*. If we make this method *async*, it won’t work well because
   * it will cause problems when we’re trying to set up the {@link LifeCycleEditorElementSemaphore#_semaphores} map entries.
   */
  _lock() {
    const { _semaphores } = _LifeCycleElementSemaphore2;
    const { _state, _element, _lifecycle } = this;
    const prevElementSemaphore = _semaphores.get(_element) || Promise.resolve(null);
    const releaseLock = createDefer();
    this._releaseLock = releaseLock;
    const newElementSemaphore = prevElementSemaphore.then(() => {
      if (_state.destroyedBeforeInitialization) {
        return Promise.resolve(void 0);
      }
      _state.mountingInProgress = _lifecycle.mount().then((mountResult) => {
        if (mountResult) {
          this.unsafeSetValue(mountResult);
        }
        return mountResult;
      });
      return _state.mountingInProgress;
    }).then(async (mountResult) => {
      if (mountResult && _lifecycle.afterMount) {
        await _lifecycle.afterMount({
          element: _element,
          mountResult
        });
      }
    }).then(() => releaseLock.promise).catch((error) => {
      console.error("Semaphore mounting error:", error);
    }).then(() => {
      if (_semaphores.get(_element) === newElementSemaphore) {
        _semaphores.delete(_element);
      }
    });
    _semaphores.set(_element, newElementSemaphore);
  }
};
__publicField(_LifeCycleElementSemaphore, "_semaphores", /* @__PURE__ */ new Map());
var LifeCycleElementSemaphore = _LifeCycleElementSemaphore;
var ReactContextMetadataKey = "$__CKEditorReactContextMetadata";
function withCKEditorReactContextMetadata(metadata, config) {
  return {
    ...config,
    [ReactContextMetadataKey]: metadata
  };
}
function tryExtractCKEditorReactContextMetadata(object) {
  return object.get(ReactContextMetadataKey);
}
var useIsMountedRef = () => {
  const mountedRef = (0, import_react.useRef)(false);
  (0, import_react.useEffect)(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  return mountedRef;
};
var useRefSafeCallback = (fn) => {
  const callbackRef = (0, import_react.useRef)();
  callbackRef.current = fn;
  return (0, import_react.useCallback)(
    (...args) => callbackRef.current(...args),
    []
  );
};
var useInitializedCKEditorsMap = ({
  currentContextWatchdog,
  onChangeInitializedEditors
}) => {
  const onChangeInitializedEditorsSafe = useRefSafeCallback(onChangeInitializedEditors || (() => {
  }));
  (0, import_react.useEffect)(() => {
    var _a;
    if (currentContextWatchdog.status !== "initialized") {
      return;
    }
    const { watchdog } = currentContextWatchdog;
    const editors = (_a = watchdog == null ? void 0 : watchdog.context) == null ? void 0 : _a.editors;
    if (!editors) {
      return;
    }
    const getInitializedContextEditors = () => [...editors].reduce(
      (map, editor) => {
        var _a2;
        if (editor.state !== "ready") {
          return map;
        }
        const metadata = tryExtractCKEditorReactContextMetadata(editor.config);
        const nameOrId = (_a2 = metadata == null ? void 0 : metadata.name) != null ? _a2 : editor.id;
        map[nameOrId] = {
          instance: editor,
          metadata
        };
        return map;
      },
      /* @__PURE__ */ Object.create({})
      // Prevent the prototype pollution.
    );
    const onEditorStatusChange = () => {
      onChangeInitializedEditorsSafe(
        getInitializedContextEditors(),
        watchdog
      );
    };
    const onAddEditor = (_, editor) => {
      editor.once("ready", onEditorStatusChange, { priority: "lowest" });
      editor.once("destroy", onEditorStatusChange, { priority: "lowest" });
    };
    editors.on("add", onAddEditor);
    return () => {
      editors.off("add", onAddEditor);
    };
  }, [currentContextWatchdog]);
};
var ContextWatchdogContext = import_react.default.createContext(null);
var CKEditorContext = (props) => {
  const {
    id,
    context,
    watchdogConfig,
    children,
    config,
    onReady,
    contextWatchdog: ContextWatchdogConstructor,
    isLayoutReady = true,
    onChangeInitializedEditors,
    onError = (error, details) => console.error(error, details)
  } = props;
  const isMountedRef = useIsMountedRef();
  const prevWatchdogInitializationIDRef = (0, import_react.useRef)(null);
  const [currentContextWatchdog, setCurrentContextWatchdog] = (0, import_react.useState)({
    status: "initializing"
  });
  (0, import_react.useEffect)(() => {
    if (isLayoutReady) {
      initializeContextWatchdog();
    } else {
      setCurrentContextWatchdog({
        status: "initializing"
      });
    }
  }, [id, isLayoutReady]);
  (0, import_react.useEffect)(() => () => {
    if (currentContextWatchdog.status === "initialized") {
      currentContextWatchdog.watchdog.destroy();
    }
  }, [currentContextWatchdog]);
  useInitializedCKEditorsMap({
    currentContextWatchdog,
    onChangeInitializedEditors
  });
  function regenerateInitializationID() {
    prevWatchdogInitializationIDRef.current = uid();
    return prevWatchdogInitializationIDRef.current;
  }
  function canUpdateState(initializationID) {
    return prevWatchdogInitializationIDRef.current === initializationID && isMountedRef.current;
  }
  function initializeContextWatchdog() {
    const watchdogInitializationID = regenerateInitializationID();
    const contextWatchdog = new ContextWatchdogConstructor(context, watchdogConfig);
    contextWatchdog.on("error", (_, errorEvent) => {
      if (canUpdateState(watchdogInitializationID)) {
        onError(errorEvent.error, {
          phase: "runtime",
          willContextRestart: errorEvent.causesRestart
        });
      }
    });
    contextWatchdog.on("stateChange", () => {
      if (onReady && contextWatchdog.state === "ready" && canUpdateState(watchdogInitializationID)) {
        onReady(
          contextWatchdog.context,
          contextWatchdog
        );
      }
    });
    contextWatchdog.create(config).then(() => {
      if (canUpdateState(watchdogInitializationID)) {
        setCurrentContextWatchdog({
          status: "initialized",
          watchdog: contextWatchdog
        });
      } else {
        contextWatchdog.destroy();
      }
    }).catch((error) => {
      if (canUpdateState(watchdogInitializationID)) {
        onError(error, {
          phase: "initialization",
          willContextRestart: false
        });
        setCurrentContextWatchdog({
          status: "error",
          error
        });
      }
    });
    return contextWatchdog;
  }
  return import_react.default.createElement(ContextWatchdogContext.Provider, { value: currentContextWatchdog }, children);
};
var isContextWatchdogValue = (obj) => !!obj && typeof obj === "object" && "status" in obj && ["initializing", "initialized", "error"].includes(obj.status);
var isContextWatchdogValueWithStatus = (status) => (obj) => isContextWatchdogValue(obj) && obj.status === status;
var isContextWatchdogInitializing = isContextWatchdogValueWithStatus("initializing");
var isContextWatchdogReadyToUse = (obj) => isContextWatchdogValueWithStatus("initialized")(obj) && obj.watchdog.state === "ready";
var REACT_INTEGRATION_READ_ONLY_LOCK_ID$1 = "Lock from React integration (@ckeditor/ckeditor5-react)";
var CKEditor = class extends import_react.default.Component {
  constructor(props) {
    super(props);
    __publicField(this, "domContainer", import_react.default.createRef());
    __publicField(this, "editorSemaphore", null);
    this._checkVersion();
  }
  /**
   * Checks if the CKEditor version used in the application is compatible with the component.
   */
  _checkVersion() {
    const { CKEDITOR_VERSION } = window;
    if (!CKEDITOR_VERSION) {
      return console.warn('Cannot find the "CKEDITOR_VERSION" in the "window" scope.');
    }
    const [major] = CKEDITOR_VERSION.split(".").map(Number);
    if (major >= 42 || CKEDITOR_VERSION.startsWith("0.0.0")) {
      return;
    }
    console.warn("The <CKEditor> component requires using CKEditor 5 in version 42+ or nightly build.");
  }
  get _semaphoreValue() {
    const { editorSemaphore } = this;
    return editorSemaphore ? editorSemaphore.value : null;
  }
  /**
   * An watchdog instance.
   */
  get watchdog() {
    const { _semaphoreValue } = this;
    return _semaphoreValue ? _semaphoreValue.watchdog : null;
  }
  /**
   * An editor instance.
   */
  get editor() {
    const { _semaphoreValue } = this;
    return _semaphoreValue ? _semaphoreValue.instance : null;
  }
  /**
   * The CKEditor component should not be updated by React itself.
   * However, if the component identifier changes, the whole structure should be created once again.
   */
  shouldComponentUpdate(nextProps) {
    const { props, editorSemaphore } = this;
    if (nextProps.id !== props.id) {
      return true;
    }
    if (nextProps.disableWatchdog !== props.disableWatchdog) {
      return true;
    }
    if (editorSemaphore) {
      editorSemaphore.runAfterMount(({ instance }) => {
        if (this._shouldUpdateEditorData(props, nextProps, instance)) {
          instance.data.set(nextProps.data);
        }
      });
      if ("disabled" in nextProps) {
        editorSemaphore.runAfterMount(({ instance }) => {
          if (nextProps.disabled) {
            instance.enableReadOnlyMode(REACT_INTEGRATION_READ_ONLY_LOCK_ID$1);
          } else {
            instance.disableReadOnlyMode(REACT_INTEGRATION_READ_ONLY_LOCK_ID$1);
          }
        });
      }
    }
    return false;
  }
  /**
   * Initialize the editor when the component is mounted.
   */
  componentDidMount() {
    if (!isContextWatchdogInitializing(this.context)) {
      this._initLifeCycleSemaphore();
    }
  }
  /**
   * Re-render the entire component once again. The old editor will be destroyed and the new one will be created.
   */
  componentDidUpdate() {
    if (!isContextWatchdogInitializing(this.context)) {
      this._initLifeCycleSemaphore();
    }
  }
  /**
   * Destroy the editor before unmounting the component.
   */
  componentWillUnmount() {
    this._unlockLifeCycleSemaphore();
  }
  /**
   * Async destroy attached editor and unlock element semaphore.
   */
  _unlockLifeCycleSemaphore() {
    if (this.editorSemaphore) {
      this.editorSemaphore.release();
      this.editorSemaphore = null;
    }
  }
  /**
   * Unlocks previous editor semaphore and creates new one..
   */
  _initLifeCycleSemaphore() {
    this._unlockLifeCycleSemaphore();
    this.editorSemaphore = new LifeCycleElementSemaphore(this.domContainer.current, {
      mount: async () => this._initializeEditor(),
      afterMount: ({ mountResult }) => {
        const { onReady } = this.props;
        if (onReady && this.domContainer.current !== null) {
          onReady(mountResult.instance);
        }
      },
      unmount: async ({ element, mountResult }) => {
        const { onAfterDestroy } = this.props;
        try {
          await this._destroyEditor(mountResult);
          element.innerHTML = "";
        } finally {
          if (onAfterDestroy) {
            onAfterDestroy(mountResult.instance);
          }
        }
      }
    });
  }
  /**
   * Render a <div> element which will be replaced by CKEditor.
   */
  render() {
    return import_react.default.createElement("div", { ref: this.domContainer });
  }
  /**
   * Initializes the editor by creating a proper watchdog and initializing it with the editor's configuration.
   */
  async _initializeEditor() {
    if (this.props.disableWatchdog) {
      const instance = await this._createEditor(this.domContainer.current, this._getConfig());
      return {
        instance,
        watchdog: null
      };
    }
    const watchdog = (() => {
      if (isContextWatchdogReadyToUse(this.context)) {
        return new EditorWatchdogAdapter(this.context.watchdog);
      }
      return new this.props.editor.EditorWatchdog(this.props.editor, this.props.watchdogConfig);
    })();
    const totalRestartsRef = {
      current: 0
    };
    watchdog.setCreator(async (el, config) => {
      var _a;
      const { editorSemaphore } = this;
      const { onAfterDestroy } = this.props;
      if (totalRestartsRef.current > 0 && onAfterDestroy && ((_a = editorSemaphore == null ? void 0 : editorSemaphore.value) == null ? void 0 : _a.instance)) {
        onAfterDestroy(editorSemaphore.value.instance);
      }
      const instance = await this._createEditor(el, config);
      if (editorSemaphore && totalRestartsRef.current > 0) {
        editorSemaphore.unsafeSetValue({
          instance,
          watchdog
        });
        setTimeout(() => {
          if (this.props.onReady) {
            this.props.onReady(watchdog.editor);
          }
        });
      }
      totalRestartsRef.current++;
      return instance;
    });
    watchdog.on("error", (_, { error, causesRestart }) => {
      const onError = this.props.onError || console.error;
      onError(error, { phase: "runtime", willEditorRestart: causesRestart });
    });
    await watchdog.create(this.domContainer.current, this._getConfig()).catch((error) => {
      const onError = this.props.onError || console.error;
      onError(error, { phase: "initialization", willEditorRestart: false });
    });
    return {
      watchdog,
      instance: watchdog.editor
    };
  }
  /**
   * Creates an editor from the element and configuration.
   *
   * @param element The source element.
   * @param config CKEditor 5 editor configuration.
   */
  _createEditor(element, config) {
    const { contextItemMetadata } = this.props;
    if (contextItemMetadata) {
      config = withCKEditorReactContextMetadata(contextItemMetadata, config);
    }
    return this.props.editor.create(element, config).then((editor) => {
      if ("disabled" in this.props) {
        if (this.props.disabled) {
          editor.enableReadOnlyMode(REACT_INTEGRATION_READ_ONLY_LOCK_ID$1);
        }
      }
      const modelDocument = editor.model.document;
      const viewDocument = editor.editing.view.document;
      modelDocument.on("change:data", (event) => {
        if (this.props.onChange) {
          this.props.onChange(event, editor);
        }
      });
      viewDocument.on("focus", (event) => {
        if (this.props.onFocus) {
          this.props.onFocus(event, editor);
        }
      });
      viewDocument.on("blur", (event) => {
        if (this.props.onBlur) {
          this.props.onBlur(event, editor);
        }
      });
      return editor;
    });
  }
  /**
   * Destroys the editor by destroying the watchdog.
   */
  async _destroyEditor(initializeResult) {
    const { watchdog, instance } = initializeResult;
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          if (watchdog) {
            await watchdog.destroy();
            return resolve();
          }
          if (instance) {
            await instance.destroy();
            return resolve();
          }
          resolve();
        } catch (e) {
          console.error(e);
          reject(e);
        }
      });
    });
  }
  /**
   * Returns true when the editor should be updated.
   *
   * @param prevProps Previous react's properties.
   * @param nextProps React's properties.
   * @param editor Current editor instance.
   */
  _shouldUpdateEditorData(prevProps, nextProps, editor) {
    if (prevProps.data === nextProps.data) {
      return false;
    }
    if (editor.data.get() === nextProps.data) {
      return false;
    }
    return true;
  }
  /**
   * Returns the editor configuration.
   */
  _getConfig() {
    const config = this.props.config || {};
    if (this.props.data && config.initialData) {
      console.warn(
        "Editor data should be provided either using `config.initialData` or `content` property. The config value takes precedence over `content` property and will be used when both are specified."
      );
    }
    return {
      ...config,
      initialData: config.initialData || this.props.data || ""
    };
  }
};
__publicField(CKEditor, "contextType", ContextWatchdogContext);
__publicField(CKEditor, "propTypes", {
  editor: import_prop_types.default.func.isRequired,
  data: import_prop_types.default.string,
  config: import_prop_types.default.object,
  disableWatchdog: import_prop_types.default.bool,
  watchdogConfig: import_prop_types.default.object,
  onChange: import_prop_types.default.func,
  onReady: import_prop_types.default.func,
  onFocus: import_prop_types.default.func,
  onBlur: import_prop_types.default.func,
  onError: import_prop_types.default.func,
  disabled: import_prop_types.default.bool,
  id: import_prop_types.default.any
});
var EditorWatchdogAdapter = class {
  /**
   * @param contextWatchdog The context watchdog instance that will be wrapped into editor watchdog API.
   */
  constructor(contextWatchdog) {
    __publicField(this, "_contextWatchdog");
    __publicField(this, "_id");
    __publicField(this, "_creator");
    this._contextWatchdog = contextWatchdog;
    this._id = uid();
  }
  /**
   *  @param creator A watchdog's editor creator function.
   */
  setCreator(creator) {
    this._creator = creator;
  }
  /**
   * Adds an editor configuration to the context watchdog registry. Creates an instance of it.
   *
   * @param sourceElementOrData A source element or data for the new editor.
   * @param config CKEditor 5 editor config.
   */
  create(sourceElementOrData, config) {
    return this._contextWatchdog.add({
      sourceElementOrData,
      config,
      creator: this._creator,
      id: this._id,
      type: "editor"
    });
  }
  /**
   * Creates a listener that is attached to context watchdog's item and run when the context watchdog fires.
   * Currently works only for the `error` event.
   */
  on(_, callback) {
    this._contextWatchdog.on("itemError", (_2, { itemId, error }) => {
      if (itemId === this._id) {
        callback(null, { error, causesRestart: void 0 });
      }
    });
  }
  destroy() {
    if (this._contextWatchdog.state === "ready") {
      return this._contextWatchdog.remove(this._id);
    }
    return Promise.resolve();
  }
  /**
   * An editor instance.
   */
  get editor() {
    return this._contextWatchdog.getItem(this._id);
  }
};
var useLifeCycleSemaphoreSyncRef = () => {
  const semaphoreRef = (0, import_react.useRef)(null);
  const [revision, setRevision] = (0, import_react.useState)(() => Date.now());
  const refresh = () => {
    setRevision(Date.now());
  };
  const release = (rerender = true) => {
    if (semaphoreRef.current) {
      semaphoreRef.current.release();
      semaphoreRef.current = null;
    }
    if (rerender) {
      setRevision(Date.now());
    }
  };
  const unsafeSetValue = (value) => {
    var _a;
    (_a = semaphoreRef.current) == null ? void 0 : _a.unsafeSetValue(value);
    refresh();
  };
  const runAfterMount = (callback) => {
    if (semaphoreRef.current) {
      semaphoreRef.current.runAfterMount(callback);
    }
  };
  const replace = (newSemaphore) => {
    release(false);
    semaphoreRef.current = newSemaphore();
    refresh();
    runAfterMount(refresh);
  };
  const createAttributeRef = (key) => ({
    get current() {
      if (!semaphoreRef.current || !semaphoreRef.current.value) {
        return null;
      }
      return semaphoreRef.current.value[key];
    }
  });
  return {
    get current() {
      return semaphoreRef.current;
    },
    revision,
    createAttributeRef,
    unsafeSetValue,
    release,
    replace,
    runAfterMount
  };
};
function mergeRefs(...refs) {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        ref.current = value;
      }
    });
  };
}
var useInstantEffect = (fn, deps) => {
  const [prevDeps, setDeps] = (0, import_react.useState)(null);
  if (!shallowCompareArrays(prevDeps, deps)) {
    fn();
    setDeps([...deps]);
  }
};
var useInstantEditorEffect = (semaphore, fn, deps) => {
  useInstantEffect(() => {
    if (semaphore) {
      semaphore.runAfterMount(fn);
    }
  }, [semaphore, ...deps]);
};
var REACT_INTEGRATION_READ_ONLY_LOCK_ID = "Lock from React integration (@ckeditor/ckeditor5-react)";
var useMultiRootEditor = (props) => {
  const semaphoreElementRef = (0, import_react.useRef)(props.semaphoreElement || null);
  const semaphore = useLifeCycleSemaphoreSyncRef();
  const editorRefs = {
    watchdog: semaphore.createAttributeRef("watchdog"),
    instance: semaphore.createAttributeRef("instance")
  };
  const context = (0, import_react.useContext)(ContextWatchdogContext);
  const [roots, setRoots] = (0, import_react.useState)(() => Object.keys(props.data));
  const [data, setData] = (0, import_react.useState)({ ...props.data });
  const [attributes, setAttributes] = (0, import_react.useState)({ ...props.rootsAttributes });
  const shouldUpdateEditor = (0, import_react.useRef)(true);
  const forceAssignFakeEditableElements = () => {
    const editor = editorRefs.instance.current;
    if (!editor) {
      return;
    }
    const initializeEditableWithFakeElement = (editable) => {
      if (editable.name && !editor.editing.view.getDomRoot(editable.name)) {
        editor.editing.view.attachDomRoot(document.createElement("div"), editable.name);
      }
    };
    Object.values(editor.ui.view.editables).forEach(initializeEditableWithFakeElement);
  };
  (0, import_react.useEffect)(() => {
    const semaphoreElement = semaphoreElementRef.current;
    if (context && !isContextWatchdogReadyToUse(context)) {
      return;
    }
    if (!semaphoreElement || props.isLayoutReady === false) {
      return;
    }
    semaphore.replace(() => new LifeCycleElementSemaphore(semaphoreElement, {
      mount: _initializeEditor,
      afterMount: ({ mountResult }) => {
        const { onReady } = props;
        if (onReady && semaphoreElementRef.current !== null) {
          onReady(mountResult.instance);
        }
      },
      unmount: async ({ element, mountResult }) => {
        const { onAfterDestroy } = props;
        try {
          await _destroyEditor(mountResult);
          element.innerHTML = "";
        } finally {
          if (onAfterDestroy) {
            onAfterDestroy(mountResult.instance);
          }
        }
      }
    }));
    return () => {
      forceAssignFakeEditableElements();
      semaphore.release(false);
    };
  }, [props.id, props.isLayoutReady, context == null ? void 0 : context.status]);
  const _getConfig = () => {
    const config = props.config || {};
    if (props.data && config.initialData) {
      console.warn(
        "Editor data should be provided either using `config.initialData` or `data` property. The config value takes precedence over `data` property and will be used when both are specified."
      );
    }
    return {
      ...config,
      rootsAttributes: attributes
    };
  };
  const onChangeData = useRefSafeCallback((editor, event) => {
    const modelDocument = editor.model.document;
    if (!props.disableTwoWayDataBinding) {
      const newData = {};
      const newAttributes = {};
      modelDocument.differ.getChanges().forEach((change) => {
        let root;
        if (change.type == "insert" || change.type == "remove") {
          root = change.position.root;
        } else {
          root = change.range.root;
        }
        if (!root.isAttached()) {
          return;
        }
        const { rootName } = root;
        newData[rootName] = editor.getData({ rootName });
      });
      modelDocument.differ.getChangedRoots().forEach((changedRoot) => {
        if (changedRoot.state) {
          if (newData[changedRoot.name] !== void 0) {
            delete newData[changedRoot.name];
          }
          return;
        }
        const rootName = changedRoot.name;
        newAttributes[rootName] = editor.getRootAttributes(rootName);
      });
      if (Object.keys(newData).length) {
        setData((previousData) => ({ ...previousData, ...newData }));
      }
      if (Object.keys(newAttributes).length) {
        setAttributes((previousAttributes) => ({ ...previousAttributes, ...newAttributes }));
      }
    }
    if (props.onChange) {
      props.onChange(event, editor);
    }
  });
  const onAddRoot = useRefSafeCallback((editor, _evt, root) => {
    const rootName = root.rootName;
    if (!props.disableTwoWayDataBinding) {
      setData(
        (previousData) => ({ ...previousData, [rootName]: editor.getData({ rootName }) })
      );
      setAttributes(
        (previousAttributes) => ({ ...previousAttributes, [rootName]: editor.getRootAttributes(rootName) })
      );
    }
    setRoots((prevRoots) => uniq([...prevRoots, root.rootName]));
  });
  const onDetachRoot = useRefSafeCallback((_editor, _evt, root) => {
    const rootName = root.rootName;
    if (!props.disableTwoWayDataBinding) {
      setData((previousData) => {
        const { [rootName]: _, ...newData } = previousData;
        return { ...newData };
      });
      setAttributes((previousAttributes) => {
        const { [rootName]: _, ...newAttributes } = previousAttributes;
        return { ...newAttributes };
      });
    }
    setRoots((prevRoots) => prevRoots.filter((root2) => root2 !== rootName));
  });
  const _createEditor = useRefSafeCallback((initialData, config) => {
    overwriteObject({ ...props.rootsAttributes }, attributes);
    overwriteObject({ ...props.data }, data);
    overwriteArray(Object.keys(props.data), roots);
    return props.editor.create(initialData, config).then((editor) => {
      const editorData = editor.getFullData();
      overwriteObject({ ...editorData }, data);
      overwriteObject({ ...editor.getRootsAttributes() }, attributes);
      overwriteArray(Object.keys(editorData), roots);
      if (props.disabled) {
        editor.enableReadOnlyMode(REACT_INTEGRATION_READ_ONLY_LOCK_ID);
      }
      const modelDocument = editor.model.document;
      const viewDocument = editor.editing.view.document;
      modelDocument.on("change:data", (evt) => onChangeData(editor, evt));
      editor.on("addRoot", (evt, root) => onAddRoot(editor, evt, root));
      editor.on("detachRoot", (evt, root) => onDetachRoot(editor, evt, root));
      viewDocument.on("focus", (event) => {
        if (props.onFocus) {
          props.onFocus(event, editor);
        }
      });
      viewDocument.on("blur", (event) => {
        if (props.onBlur) {
          props.onBlur(event, editor);
        }
      });
      return editor;
    });
  });
  const _destroyEditor = (initializeResult) => {
    const { watchdog, instance } = initializeResult;
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          if (watchdog) {
            await watchdog.destroy();
            return resolve();
          }
          if (instance) {
            await instance.destroy();
            return resolve();
          }
          resolve();
        } catch (e) {
          console.error(e);
          reject(e);
        }
      });
    });
  };
  const _initializeEditor = async () => {
    if (props.disableWatchdog) {
      const instance = await _createEditor(props.data, _getConfig());
      return {
        instance,
        watchdog: null
      };
    }
    const watchdog = (() => {
      if (isContextWatchdogReadyToUse(context)) {
        return new EditorWatchdogAdapter(context.watchdog);
      }
      return new props.editor.EditorWatchdog(props.editor, props.watchdogConfig);
    })();
    const totalRestartsRef = {
      current: 0
    };
    watchdog.setCreator(async (_, config) => {
      const { onAfterDestroy } = props;
      if (totalRestartsRef.current > 0 && onAfterDestroy && editorRefs.instance.current) {
        onAfterDestroy(editorRefs.instance.current);
      }
      const instance = await _createEditor(data, config);
      if (totalRestartsRef.current > 0) {
        semaphore.unsafeSetValue({
          instance,
          watchdog
        });
        setTimeout(() => {
          if (props.onReady) {
            props.onReady(watchdog.editor);
          }
        });
      }
      totalRestartsRef.current++;
      return instance;
    });
    watchdog.on("error", (_, { error, causesRestart }) => {
      const onError = props.onError || console.error;
      onError(error, { phase: "runtime", willEditorRestart: causesRestart });
    });
    await watchdog.create(data, _getConfig()).catch((error) => {
      const onError = props.onError || console.error;
      onError(error, { phase: "initialization", willEditorRestart: false });
      throw error;
    });
    return {
      watchdog,
      instance: watchdog.editor
    };
  };
  const _getStateDiff = (previousState, newState) => {
    const previousStateKeys = Object.keys(previousState);
    const newStateKeys = Object.keys(newState);
    return {
      addedKeys: newStateKeys.filter((key) => !previousStateKeys.includes(key)),
      removedKeys: previousStateKeys.filter((key) => !newStateKeys.includes(key))
    };
  };
  const _externalSetData = (0, import_react.useCallback)(
    (newData) => {
      semaphore.runAfterMount(() => {
        shouldUpdateEditor.current = true;
        setData(newData);
      });
    },
    [setData]
  );
  const _externalSetAttributes = (0, import_react.useCallback)(
    (newAttributes) => {
      semaphore.runAfterMount(() => {
        shouldUpdateEditor.current = true;
        setAttributes(newAttributes);
      });
    },
    [setAttributes]
  );
  const toolbarElement = import_react.default.createElement(
    EditorToolbarWrapper,
    {
      ref: semaphoreElementRef,
      editor: editorRefs.instance.current
    }
  );
  useInstantEditorEffect(semaphore.current, ({ instance }) => {
    if (props.disabled) {
      instance.enableReadOnlyMode(REACT_INTEGRATION_READ_ONLY_LOCK_ID);
    } else {
      instance.disableReadOnlyMode(REACT_INTEGRATION_READ_ONLY_LOCK_ID);
    }
  }, [props.disabled]);
  useInstantEditorEffect(semaphore.current, ({ instance }) => {
    if (shouldUpdateEditor.current) {
      shouldUpdateEditor.current = false;
      const dataKeys = Object.keys(data);
      const attributesKeys = Object.keys(attributes);
      if (!dataKeys.every((key) => attributesKeys.includes(key))) {
        console.error("`data` and `attributes` objects must have the same keys (roots).");
        throw new Error("`data` and `attributes` objects must have the same keys (roots).");
      }
      const editorData = instance.getFullData();
      const editorAttributes = instance.getRootsAttributes();
      const {
        addedKeys: newRoots,
        removedKeys: removedRoots
      } = _getStateDiff(
        editorData,
        data || /* istanbul ignore next -- @preserve: It should never happen, data should be always filled. */
        {}
      );
      const modifiedRoots = dataKeys.filter(
        (rootName) => editorData[rootName] !== void 0 && JSON.stringify(editorData[rootName]) !== JSON.stringify(data[rootName])
      );
      const rootsWithChangedAttributes = attributesKeys.filter((rootName) => JSON.stringify(editorAttributes[rootName]) !== JSON.stringify(attributes[rootName]));
      const _handleNewRoots = (roots2) => {
        roots2.forEach((rootName) => {
          instance.addRoot(rootName, {
            data: data[rootName] || "",
            attributes: (attributes == null ? void 0 : attributes[rootName]) || /* istanbul ignore next -- @preserve: attributes should be in sync with root keys */
            {},
            isUndoable: true
          });
        });
      };
      const _handleRemovedRoots = (roots2) => {
        roots2.forEach((rootName) => {
          instance.detachRoot(rootName, true);
        });
      };
      const _updateEditorData = (roots2) => {
        const dataToUpdate = roots2.reduce(
          (result, rootName) => ({ ...result, [rootName]: data[rootName] }),
          /* @__PURE__ */ Object.create(null)
        );
        instance.data.set(dataToUpdate, { suppressErrorInCollaboration: true });
      };
      const _updateEditorAttributes = (writer, roots2) => {
        roots2.forEach((rootName) => {
          Object.keys(attributes[rootName]).forEach((attr) => {
            instance.registerRootAttribute(attr);
          });
          writer.clearAttributes(instance.model.document.getRoot(rootName));
          writer.setAttributes(attributes[rootName], instance.model.document.getRoot(rootName));
        });
      };
      setTimeout(() => {
        instance.model.change((writer) => {
          _handleNewRoots(newRoots);
          _handleRemovedRoots(removedRoots);
          if (modifiedRoots.length) {
            _updateEditorData(modifiedRoots);
          }
          if (rootsWithChangedAttributes.length) {
            _updateEditorAttributes(writer, rootsWithChangedAttributes);
          }
        });
      });
    }
  }, [data, attributes]);
  const editableElements = roots.map(
    (rootName) => import_react.default.createElement(
      EditorEditable,
      {
        key: rootName,
        id: rootName,
        rootName,
        semaphore
      }
    )
  );
  return {
    editor: editorRefs.instance.current,
    editableElements,
    toolbarElement,
    data,
    setData: _externalSetData,
    attributes,
    setAttributes: _externalSetAttributes
  };
};
var EditorEditable = (0, import_react.memo)((0, import_react.forwardRef)(({ id, semaphore, rootName }, ref) => {
  const innerRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    let editable;
    let editor;
    semaphore.runAfterMount(({ instance }) => {
      if (!innerRef.current) {
        return;
      }
      editor = instance;
      const { ui, model } = editor;
      const root = model.document.getRoot(rootName);
      if (root && editor.ui.getEditableElement(rootName)) {
        editor.detachEditable(root);
      }
      editable = ui.view.createEditable(rootName, innerRef.current);
      ui.addEditable(editable);
      instance.editing.view.forceRender();
    });
    return () => {
      if (editor && editor.state !== "destroyed" && innerRef.current) {
        const root = editor.model.document.getRoot(rootName);
        if (root) {
          editor.detachEditable(root);
        }
      }
    };
  }, [semaphore.revision]);
  return import_react.default.createElement(
    "div",
    {
      key: semaphore.revision,
      id,
      ref: mergeRefs(ref, innerRef)
    }
  );
}));
EditorEditable.displayName = "EditorEditable";
var EditorToolbarWrapper = (0, import_react.forwardRef)(({ editor }, ref) => {
  const toolbarRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    const toolbarContainer = toolbarRef.current;
    if (!editor || !toolbarContainer) {
      return void 0;
    }
    const element = editor.ui.view.toolbar.element;
    toolbarContainer.appendChild(element);
    return () => {
      if (toolbarContainer.contains(element)) {
        toolbarContainer.removeChild(element);
      }
    };
  }, [editor && editor.id]);
  return import_react.default.createElement("div", { ref: mergeRefs(toolbarRef, ref) });
});
EditorToolbarWrapper.displayName = "EditorToolbarWrapper";
var useIsUnmountedRef = () => {
  const mountedRef = (0, import_react.useRef)(false);
  (0, import_react.useEffect)(() => {
    mountedRef.current = false;
    return () => {
      mountedRef.current = true;
    };
  }, []);
  return mountedRef;
};
var useAsyncCallback = (callback) => {
  const [asyncState, setAsyncState] = (0, import_react.useState)({
    status: "idle"
  });
  const unmountedRef = useIsUnmountedRef();
  const prevExecutionUIDRef = (0, import_react.useRef)(null);
  const asyncExecutor = useRefSafeCallback(async (...args) => {
    if (unmountedRef.current || isSSR()) {
      return null;
    }
    const currentExecutionUUID = uid();
    prevExecutionUIDRef.current = currentExecutionUUID;
    try {
      if (asyncState.status !== "loading") {
        setAsyncState({
          status: "loading"
        });
      }
      const result = await callback(...args);
      if (!unmountedRef.current && prevExecutionUIDRef.current === currentExecutionUUID) {
        setAsyncState({
          status: "success",
          data: result
        });
      }
      return result;
    } catch (error) {
      console.error(error);
      if (!unmountedRef.current && prevExecutionUIDRef.current === currentExecutionUUID) {
        setAsyncState({
          status: "error",
          error
        });
      }
    }
    return null;
  });
  return [asyncExecutor, asyncState];
};
var useAsyncValue = (callback, deps) => {
  const [asyncCallback, asyncState] = useAsyncCallback(callback);
  useInstantEffect(asyncCallback, deps);
  if (asyncState.status === "idle") {
    return {
      status: "loading"
    };
  }
  return asyncState;
};
function useCKEditorCloud(config) {
  const serializedConfigKey = JSON.stringify(config);
  const result = useAsyncValue(
    async () => loadCKEditorCloud(config),
    [serializedConfigKey]
  );
  if (result.status === "success") {
    return {
      ...result.data,
      status: "success"
    };
  }
  return result;
}
var withCKEditorCloud = (config) => (WrappedComponent) => {
  const ComponentWithCKEditorCloud = (props) => {
    var _a, _b;
    const ckeditorCloudResult = useCKEditorCloud(config.cloud);
    switch (ckeditorCloudResult.status) {
      case "error":
        if (!config.renderError) {
          return "Unable to load CKEditor Cloud data!";
        }
        return config.renderError(ckeditorCloudResult.error);
      case "success":
        return import_react.default.createElement(WrappedComponent, { ...props, cloud: ckeditorCloudResult });
      default:
        return (_b = (_a = config.renderLoader) == null ? void 0 : _a.call(config)) != null ? _b : null;
    }
  };
  ComponentWithCKEditorCloud.displayName = "ComponentWithCKEditorCloud";
  return ComponentWithCKEditorCloud;
};
export {
  CKEditor,
  CKEditorContext,
  loadCKEditorCloud,
  useCKEditorCloud,
  useMultiRootEditor,
  withCKEditorCloud
};
/*! Bundled license information:

@ckeditor/ckeditor5-integrations-common/dist/index.js:
  (**
   * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
   * For licensing, see LICENSE.md.
   *)

@ckeditor/ckeditor5-integrations-common/dist/index.js:
  (**
   * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
   * For licensing, see LICENSE.md.
   *)

@ckeditor/ckeditor5-integrations-common/dist/index.js:
  (**
   * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
   * For licensing, see LICENSE.md.
   *)

@ckeditor/ckeditor5-integrations-common/dist/index.js:
  (**
   * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
   * For licensing, see LICENSE.md.
   *)

@ckeditor/ckeditor5-integrations-common/dist/index.js:
  (**
   * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
   * For licensing, see LICENSE.md.
   *)

@ckeditor/ckeditor5-react/dist/index.js:
  (**
   * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
   * For licensing, see LICENSE.md.
   *)
  (* istanbul ignore else -- @preserve *)
  (* istanbul ignore next -- @preserve *)
*/
//# sourceMappingURL=@ckeditor_ckeditor5-react.js.map
