import { argv } from 'yargs';

// task names
export const commands = argv._.slice();
// dynamic arguments
export const args = Object.assign({}, argv);

// clear arguments
delete args._;
delete args.$0;