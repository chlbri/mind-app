/**
 *
 * All paths of the concerned files
 * 
 * ### Author
 *
 * chlbri (bri_lvi@icloud.com)
 *
 * [My GitHub](https://github.com/chlbri?tab=repositories)
 *
 * <br/>
 *
 * ### Documentation
 *
 * Link to machine lib [here](https://www.npmjs.com/package/@bemedev/app-ts).
 *
 * Link to this lib [here](https://www.npmjs.com/package/@bemedev/app-cli)
 *
 *
 * This file is auto-generated. Do not edit manually.
 */
   export type _AllPaths = {
    machine: '/' | '/idle' | '/initialization' | '/initialization/edges' | '/initialization/nodes' | '/initialization/next' | '/mounting' | '/mounting/nodes' | '/mounting/nodes/offsets' | '/mounting/edges' | '/mounting/edges/actives' | '/mounting/edges/positions' | '/measure' | '/working' | '/working/nodes' | '/working/edges';
  }
   /**
   * 
   * Constants as type helpers for the concerned file. 
   * Don't use it as values, just for typings
   * 
   * ### Author
   * 
   * chlbri (bri_lvi@icloud.com)
   * 
   * [My GitHub](https://github.com/chlbri?tab=repositories)
   * 
   * <br/>
   * 
   * ### Documentation
   *
   * Link to machine lib [here](https://www.npmjs.com/package/@bemedev/app-ts).
   * 
   * Link to this lib [here](https://www.npmjs.com/package/@bemedev/app-cli)
   * 
   * NB: This file is auto-generated. Do not edit manually.
   */
    export const SCHEMAS = {
   machine: {
        __tsSchema: undefined as unknown as {
      readonly targets: Exclude<_AllPaths['machine'], '/'>;
      readonly states: {
        readonly idle: {
      readonly targets: Exclude<_AllPaths['machine'], '/idle'>;
    };
   readonly initialization: {
      readonly targets: Exclude<_AllPaths['machine'], '/initialization'>;
      readonly states: {
        readonly edges: {
      readonly targets: Exclude<_AllPaths['machine'], '/initialization/edges'>;
    };
   readonly nodes: {
      readonly targets: Exclude<_AllPaths['machine'], '/initialization/nodes'>;
    };
   readonly next: {
      readonly targets: Exclude<_AllPaths['machine'], '/initialization/next'>;
    };
      };
      readonly initial: 'edges' | 'nodes' | 'next';
    };
   readonly mounting: {
      readonly targets: Exclude<_AllPaths['machine'], '/mounting'>;
      readonly states: {
        readonly nodes: {
      readonly targets: Exclude<_AllPaths['machine'], '/mounting/nodes'>;
      readonly states: {
        readonly offsets: {
      readonly targets: Exclude<_AllPaths['machine'], '/mounting/nodes/offsets'>;
    };
      };
      readonly initial: 'offsets';
    };
   readonly edges: {
      readonly targets: Exclude<_AllPaths['machine'], '/mounting/edges'>;
      readonly states: {
        readonly actives: {
      readonly targets: Exclude<_AllPaths['machine'], '/mounting/edges/actives'>;
    };
   readonly positions: {
      readonly targets: Exclude<_AllPaths['machine'], '/mounting/edges/positions'>;
    };
      };
      readonly initial: 'actives' | 'positions';
    };
      };
      readonly initial: 'nodes' | 'edges';
    };
   readonly measure: {
      readonly targets: Exclude<_AllPaths['machine'], '/measure'>;
    };
   readonly working: {
      readonly targets: Exclude<_AllPaths['machine'], '/working'>;
      readonly states: {
        readonly nodes: {
      readonly targets: Exclude<_AllPaths['machine'], '/working/nodes'>;
    };
   readonly edges: {
      readonly targets: Exclude<_AllPaths['machine'], '/working/edges'>;
    };
      };
    };
      };
      readonly initial: 'idle' | 'initialization' | 'mounting' | 'measure' | 'working';
    },
      },
   }