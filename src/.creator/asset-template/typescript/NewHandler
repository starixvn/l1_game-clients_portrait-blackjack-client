import { inject, injectable } from "inversify";

import { IHandler } from "../../shared";

@injectable()
export class NewHandler implements IHandler<{ params: any }> {
    constructor(@inject(YourStore) protected readonly store: YourStore) {}

    handle({ params: any }) {}
}
