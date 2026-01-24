// Polyfill TextEncoder/TextDecoder for Jest (needed for js-xxhash in Node.js 22)
import { TextEncoder, TextDecoder } from "util";

Object.assign(global, { TextEncoder, TextDecoder });
