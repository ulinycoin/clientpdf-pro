import assert from 'node:assert/strict';
import test from 'node:test';
import { buildQpdfEncryptArgs } from './qpdf-engine';

test('buildQpdfEncryptArgs builds baseline args', () => {
  const args = buildQpdfEncryptArgs('/tmp/in.pdf', '/tmp/out.pdf', {
    userPassword: 'user-secret',
    ownerPassword: 'owner-secret',
    keyLength: 256,
  });

  assert.deepEqual(args, [
    '--encrypt',
    'user-secret',
    'owner-secret',
    '256',
    '--',
    '/tmp/in.pdf',
    '/tmp/out.pdf',
  ]);
});

test('buildQpdfEncryptArgs includes permission flags', () => {
  const args = buildQpdfEncryptArgs('/tmp/in.pdf', '/tmp/out.pdf', {
    userPassword: '',
    ownerPassword: 'owner-only-restrictions',
    keyLength: 128,
    printing: 'low',
    modify: 'annotate',
    extract: false,
    accessibility: true,
    annotate: false,
    form: true,
    assemble: false,
    modifyOther: false,
    cleartextMetadata: true,
  });

  assert.deepEqual(args, [
    '--encrypt',
    '',
    'owner-only-restrictions',
    '128',
    '--print=low',
    '--modify=annotate',
    '--extract=n',
    '--accessibility=y',
    '--annotate=n',
    '--form=y',
    '--assemble=n',
    '--modify-other=n',
    '--cleartext-metadata',
    '--',
    '/tmp/in.pdf',
    '/tmp/out.pdf',
  ]);
});
