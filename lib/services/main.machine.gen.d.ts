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
    machine: '/' | '/idle' | '/construction' | '/working';
};
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
export declare const SCHEMAS: {
    machine: {
        __tsSchema: {
            readonly targets: Exclude<_AllPaths["machine"], "/">;
            readonly states: {
                readonly idle: {
                    readonly targets: Exclude<_AllPaths["machine"], "/idle">;
                };
                readonly construction: {
                    readonly targets: Exclude<_AllPaths["machine"], "/construction">;
                };
                readonly working: {
                    readonly targets: Exclude<_AllPaths["machine"], "/working">;
                };
            };
            readonly initial: "idle" | "construction" | "working";
        };
    };
};
//# sourceMappingURL=main.machine.gen.d.ts.map