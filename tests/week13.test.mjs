import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyCase,validateCase,changeCaseField} from '../lib/rules.mjs';
const base={...emptyCase,code:'TEST-1',description:'Fictional leak',responsible:'Test technician',next_action:'Call',follow_up:'2026-11-06'};
test('assignment defaults to pending acceptance',()=>assert.equal(validateCase(base).value.acceptance,'pending'));
test('reassigning never carries over the previous person acceptance',()=>{
 const c=changeCaseField({...base,acceptance:'accepted',acceptance_date:'2026-11-01',acceptance_source:'Call'},'responsible','Different technician');
 assert.equal(c.acceptance,'pending');assert.equal(c.acceptance_date,'');assert.equal(c.acceptance_source,'');
});
for(const acceptance of ['accepted','declined']) {
 test(acceptance+' requires dated source',()=>assert.ok(validateCase({...base,acceptance}).errors.length));
 test(acceptance+' accepts a dated source',()=>assert.equal(validateCase({...base,acceptance,acceptance_date:'2026-11-01',acceptance_source:'Test call'}).errors.length,0));
}
test('acceptance rejects malformed or future dates and invalid enums',()=>{
 for(const extra of [{acceptance:'magic'},{acceptance_date:'2026-02-31'},{acceptance_date:'2099-01-01'},{acceptance_source:'x'.repeat(101)}])assert.ok(validateCase({...base,...extra}).errors.length);
});
test('continued leak cannot bypass reopening by direct API payload',()=>{
 assert.ok(validateCase({...base,household_result:'continued',reopen_reason:'Still leaking',status:'reported'}).errors.length);
 assert.equal(validateCase({...base,household_result:'continued',reopen_reason:'Still leaking',status:'reopened'}).errors.length,0);
});
