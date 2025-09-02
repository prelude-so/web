let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) {
  return heap[idx];
}

let heap_next = heap.length;

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];

  heap[idx] = obj;
  return idx;
}

let WASM_VECTOR_LEN = 0;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
  if (
    cachedUint8ArrayMemory0 === null ||
    cachedUint8ArrayMemory0.byteLength === 0
  ) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}

const cachedTextEncoder =
  typeof TextEncoder !== "undefined"
    ? new TextEncoder("utf-8")
    : {
        encode: () => {
          throw Error("TextEncoder not available");
        },
      };

const encodeString =
  typeof cachedTextEncoder.encodeInto === "function"
    ? function (arg, view) {
        return cachedTextEncoder.encodeInto(arg, view);
      }
    : function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
          read: arg.length,
          written: buf.length,
        };
      };

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0()
      .subarray(ptr, ptr + buf.length)
      .set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;

  const mem = getUint8ArrayMemory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7f) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, (len = offset + arg.length * 3), 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);

    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

function isLikeNone(x) {
  return x === undefined || x === null;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
  if (
    cachedDataViewMemory0 === null ||
    cachedDataViewMemory0.buffer.detached === true ||
    (cachedDataViewMemory0.buffer.detached === undefined &&
      cachedDataViewMemory0.buffer !== wasm.memory.buffer)
  ) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}

function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    wasm.__wbindgen_export_2(addHeapObject(e));
  }
}

function passArrayJsValueToWasm0(array, malloc) {
  const ptr = malloc(array.length * 4, 4) >>> 0;
  const mem = getDataViewMemory0();
  for (let i = 0; i < array.length; i++) {
    mem.setUint32(ptr + 4 * i, addHeapObject(array[i]), true);
  }
  WASM_VECTOR_LEN = array.length;
  return ptr;
}

function dropObject(idx) {
  if (idx < 132) return;
  heap[idx] = heap_next;
  heap_next = idx;
}

function takeObject(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}

const cachedTextDecoder =
  typeof TextDecoder !== "undefined"
    ? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true })
    : {
        decode: () => {
          throw Error("TextDecoder not available");
        },
      };

if (typeof TextDecoder !== "undefined") {
  cachedTextDecoder.decode();
}

function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(
    getUint8ArrayMemory0().subarray(ptr, ptr + len),
  );
}
/**
 * @returns {string}
 */
export function get_dispatch_id() {
  let deferred1_0;
  let deferred1_1;
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.get_dispatch_id(retptr);
    var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
    var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
    deferred1_0 = r0;
    deferred1_1 = r1;
    return getStringFromWasm0(r0, r1);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
    wasm.__wbindgen_export_3(deferred1_0, deferred1_1, 1);
  }
}

/**
 * @returns {string}
 */
export function get_default_endpoint() {
  let deferred1_0;
  let deferred1_1;
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.get_default_endpoint(retptr);
    var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
    var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
    deferred1_0 = r0;
    deferred1_1 = r1;
    return getStringFromWasm0(r0, r1);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
    wasm.__wbindgen_export_3(deferred1_0, deferred1_1, 1);
  }
}

/**
 * @returns {string}
 */
export function get_version() {
  let deferred1_0;
  let deferred1_1;
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.get_version(retptr);
    var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
    var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
    deferred1_0 = r0;
    deferred1_1 = r1;
    return getStringFromWasm0(r0, r1);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
    wasm.__wbindgen_export_3(deferred1_0, deferred1_1, 1);
  }
}

let stack_pointer = 128;

function addBorrowedObject(obj) {
  if (stack_pointer == 1) throw new Error("out of js stack");
  heap[--stack_pointer] = obj;
  return stack_pointer;
}
/**
 * @param {any} signals
 * @returns {Uint8Array}
 */
export function generate_payload(signals) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.generate_payload(retptr, addBorrowedObject(signals));
    var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
    var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
    var v1 = getArrayU8FromWasm0(r0, r1).slice();
    wasm.__wbindgen_export_3(r0, r1 * 1, 1);
    return v1;
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
    heap[stack_pointer++] = undefined;
  }
}

async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        if (module.headers.get("Content-Type") != "application/wasm") {
          console.warn(
            "`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",
            e,
          );
        } else {
          throw e;
        }
      }
    }

    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);

    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
}

function __wbg_get_imports() {
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbg_application_4961057d054b547c = function (arg0) {
    const ret = getObject(arg0).application;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_architecture_5082b6fda62b519c = function (arg0, arg1) {
    const ret = getObject(arg1).architecture;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_cellulardata_88db2dbb9f1c2b5a = function (arg0) {
    const ret = getObject(arg0).cellular_data;
    return isLikeNone(ret) ? 0xffffff : ret ? 1 : 0;
  };
  imports.wbg.__wbg_connectiontype_3112fd0d98ac3dec = function (arg0, arg1) {
    const ret = getObject(arg1).connectionType;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_cookiesenabled_0504c5d66902be97 = function (arg0) {
    const ret = getObject(arg0).cookiesEnabled;
    return isLikeNone(ret) ? 0xffffff : ret ? 1 : 0;
  };
  imports.wbg.__wbg_cpucount_6ab9d000acffaa72 = function (arg0) {
    const ret = getObject(arg0).cpuCount;
    return isLikeNone(ret) ? 0x100000001 : ret >> 0;
  };
  imports.wbg.__wbg_device_5ae6fbe5be4395d8 = function (arg0) {
    const ret = getObject(arg0).device;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_displayphysicalresolution_fe38c68fe13e128c = function (
    arg0,
  ) {
    const ret = getObject(arg0).displayPhysicalResolution;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
  };
  imports.wbg.__wbg_displayphysicalscale_2c378b70a99e0b07 = function (arg0) {
    const ret = getObject(arg0).displayPhysicalScale;
    return isLikeNone(ret) ? 0x100000001 : Math.fround(ret);
  };
  imports.wbg.__wbg_displayresolution_25871ac4ed4a63b5 = function (arg0) {
    const ret = getObject(arg0).displayResolution;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
  };
  imports.wbg.__wbg_displayscale_5c32b543658613df = function (arg0) {
    const ret = getObject(arg0).displayScale;
    return isLikeNone(ret) ? 0x100000001 : Math.fround(ret);
  };
  imports.wbg.__wbg_donottrack_f5c2455e439e075c = function (arg0, arg1) {
    const ret = getObject(arg1).doNotTrack;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_fontsdigest_27a46e6d62f85684 = function (arg0, arg1) {
    const ret = getObject(arg1).fontsDigest;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_getRandomValues_38097e921c2494c3 = function () {
    return handleError(function (arg0, arg1) {
      globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
    }, arguments);
  };
  imports.wbg.__wbg_getTime_46267b1c24877e30 = function (arg0) {
    const ret = getObject(arg0).getTime();
    return ret;
  };
  imports.wbg.__wbg_hardware_b867d3be28b41431 = function (arg0) {
    const ret = getObject(arg0).hardware;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_height_112346791e7c4d38 = function (arg0) {
    const ret = getObject(arg0).height;
    return ret;
  };
  imports.wbg.__wbg_id_132bff2019d54f9b = function (arg0, arg1) {
    const ret = getObject(arg1).id;
    const ptr1 = passStringToWasm0(
      ret,
      wasm.__wbindgen_export_0,
      wasm.__wbindgen_export_1,
    );
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_indexeddbenabled_27be5f165a578051 = function (arg0) {
    const ret = getObject(arg0).indexedDbEnabled;
    return isLikeNone(ret) ? 0xffffff : ret ? 1 : 0;
  };
  imports.wbg.__wbg_localecurrent_b12bfe81ca410a64 = function (arg0, arg1) {
    const ret = getObject(arg1).localeCurrent;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_localepreferred_4ba0512585290373 = function (arg0, arg1) {
    const ret = getObject(arg1).localePreferred;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passArrayJsValueToWasm0(ret, wasm.__wbindgen_export_0);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_localstorageenabled_242246564737f8c4 = function (arg0) {
    const ret = getObject(arg0).localStorageEnabled;
    return isLikeNone(ret) ? 0xffffff : ret ? 1 : 0;
  };
  imports.wbg.__wbg_manufacturer_b2fd6b5807e9a476 = function (arg0, arg1) {
    const ret = getObject(arg1).manufacturer;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_maybeheadless_8463675a9d52dd1e = function (arg0) {
    const ret = getObject(arg0).maybeHeadless;
    return isLikeNone(ret) ? 0xffffff : ret ? 1 : 0;
  };
  imports.wbg.__wbg_mediacapabilities_3a72fdc21f3e886d = function (arg0, arg1) {
    const ret = getObject(arg1).mediaCapabilities;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_memorysize_fb155033c73b6144 = function (arg0, arg1) {
    const ret = getObject(arg1).memorySize;
    getDataViewMemory0().setBigInt64(
      arg0 + 8 * 1,
      isLikeNone(ret) ? BigInt(0) : ret,
      true,
    );
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
  };
  imports.wbg.__wbg_model_0557b36f0cb2a747 = function (arg0, arg1) {
    const ret = getObject(arg1).model;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_multitouchdevice_e77de3dc92f84486 = function (arg0) {
    const ret = getObject(arg0).multiTouchDevice;
    return isLikeNone(ret) ? 0xffffff : ret ? 1 : 0;
  };
  imports.wbg.__wbg_name_cc5ee25f09ba3aa8 = function (arg0, arg1) {
    const ret = getObject(arg1).name;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_network_e1d708fa91f32257 = function (arg0) {
    const ret = getObject(arg0).network;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_new0_f788a2397c7ca929 = function () {
    const ret = new Date();
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_now_c0af25a617c25393 = function () {
    return handleError(function () {
      const ret = Date.now();
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_osrelease_d0a467fa92cc59f4 = function (arg0, arg1) {
    const ret = getObject(arg1).osRelease;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_ostype_634dc3998a49316b = function (arg0, arg1) {
    const ret = getObject(arg1).osType;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_platform_9fc8f7c7d727e853 = function (arg0, arg1) {
    const ret = getObject(arg1).platform;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_platform_faeee9b8706420f5 = function (arg0) {
    const ret = getObject(arg0).platform;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_pluginsdigest_6a73e60e9437e249 = function (arg0, arg1) {
    const ret = getObject(arg1).pluginsDigest;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_rtt_8ab385160aa3c9db = function (arg0) {
    const ret = getObject(arg0).rtt;
    return isLikeNone(ret) ? 0x100000001 : ret >> 0;
  };
  imports.wbg.__wbg_systemname_4156ebc863a941ea = function (arg0, arg1) {
    const ret = getObject(arg1).systemName;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_systemversion_00a31990d1f546a4 = function (arg0, arg1) {
    const ret = getObject(arg1).systemVersion;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_timezonecurrent_a0885f8ab4eb1620 = function (arg0, arg1) {
    const ret = getObject(arg1).timeZoneCurrent;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_useragent_6505dcf270d57903 = function (arg0, arg1) {
    const ret = getObject(arg1).userAgent;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_version_c9fa65a09e8f1a30 = function (arg0, arg1) {
    const ret = getObject(arg1).version;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_webglenabled_4f1be6c840a847fb = function (arg0) {
    const ret = getObject(arg0).webGlEnabled;
    return isLikeNone(ret) ? 0xffffff : ret ? 1 : 0;
  };
  imports.wbg.__wbg_width_dd2866e2f34b27be = function (arg0) {
    const ret = getObject(arg0).width;
    return ret;
  };
  imports.wbg.__wbindgen_object_drop_ref = function (arg0) {
    takeObject(arg0);
  };
  imports.wbg.__wbindgen_string_get = function (arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof obj === "string" ? obj : undefined;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(
          ret,
          wasm.__wbindgen_export_0,
          wasm.__wbindgen_export_1,
        );
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbindgen_throw = function (arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };

  return imports;
}

function __wbg_init_memory(imports, memory) {}

function __wbg_finalize_init(instance, module) {
  wasm = instance.exports;
  __wbg_init.__wbindgen_wasm_module = module;
  cachedDataViewMemory0 = null;
  cachedUint8ArrayMemory0 = null;

  return wasm;
}

function initSync(module) {
  if (wasm !== undefined) return wasm;

  if (typeof module !== "undefined") {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ({ module } = module);
    } else {
      console.warn(
        "using deprecated parameters for `initSync()`; pass a single object instead",
      );
    }
  }

  const imports = __wbg_get_imports();

  __wbg_init_memory(imports);

  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module);
  }

  const instance = new WebAssembly.Instance(module, imports);

  return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
  if (wasm !== undefined) return wasm;

  if (typeof module_or_path !== "undefined") {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path } = module_or_path);
    } else {
      console.warn(
        "using deprecated parameters for the initialization function; pass a single object instead",
      );
    }
  }

  const imports = __wbg_get_imports();

  if (
    typeof module_or_path === "string" ||
    (typeof Request === "function" && module_or_path instanceof Request) ||
    (typeof URL === "function" && module_or_path instanceof URL)
  ) {
    module_or_path = fetch(module_or_path);
  }

  __wbg_init_memory(imports);

  const { instance, module } = await __wbg_load(await module_or_path, imports);

  return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
