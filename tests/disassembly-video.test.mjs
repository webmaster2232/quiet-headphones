import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import test from 'node:test'
import { progressToVideoTime, smoothVideoTime } from '../src/lib/disassemblyVideo.js'

const videoPath = new URL('../public/assets/form01-disassembly.mp4', import.meta.url)

test('maps scroll progress to video time and clamps both boundaries', () => {
  assert.equal(progressToVideoTime(0, 4), 0)
  assert.equal(progressToVideoTime(0.5, 4), 2)
  assert.equal(progressToVideoTime(1, 4), 4)
  assert.equal(progressToVideoTime(-0.25, 4), 0)
  assert.equal(progressToVideoTime(1.25, 4), 4)
  assert.equal(progressToVideoTime(Number.NaN, 4), 0)
})

test('smooths large video-time changes into bounded monotonic frame steps', () => {
  assert.equal(smoothVideoTime(0, 4), 1 / 24)
  assert.equal(smoothVideoTime(1, 0), 23 / 24)
  assert.equal(smoothVideoTime(1.99, 2), 2)
  assert.equal(smoothVideoTime(2, 2), 2)
})

test('ships a non-trivial MP4 disassembly asset', async () => {
  const metadata = await stat(videoPath)
  assert.ok(metadata.size > 500_000, 'video should contain a real encoded frame sequence')

  const header = await readFile(videoPath)
  assert.equal(header.subarray(4, 8).toString('ascii'), 'ftyp')
})
