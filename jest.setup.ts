import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from 'node:util'
import { ReadableStream, TransformStream, WritableStream } from 'node:stream/web'

Object.assign(global, { ReadableStream, TextDecoder, TextEncoder, TransformStream, WritableStream })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fetch, Headers, Request, Response } = require('next/dist/compiled/@edge-runtime/primitives/fetch')

Object.assign(global, { fetch, Headers, Request, Response })

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.assign(global, { IntersectionObserver: MockIntersectionObserver })
