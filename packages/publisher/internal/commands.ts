import Publisher,
{
    type BumpOptions,
    type ChangedOptions,
    type Options,
    type PublishOptions,
    type UnpublishOptions,
    type Version,
} from "./publisher.js";

export default class Commands
{
    public static async bump(version: Version, preid?: string, build?: string, options: Options & BumpOptions = { }): Promise<void>
    {
        const bumpOptions: Required<BumpOptions> =
        {
            force:                options.force!,
            ignoreChanges:        options.ignoreChanges!,
            independent:          options.independent!,
            synchronize:          options.synchronize!,
            tag:                  options.tag!,
            updateFileReferences: options.updateFileReferences!,
        };

        await new Publisher(options).bump(version, preid, build, bumpOptions);
    }

    public static async changed(tag: string = "latest", options: Options & ChangedOptions = { }): Promise<void>
    {
        const changedOptions: Required<ChangedOptions> =
        {
            ignoreChanges:        options.ignoreChanges!,
            includePrivate:       options.includePrivate!,
            includeWorkspaceRoot: options.includeWorkspaceRoot!,
        };

        const changes = await new Publisher(options).changed(tag, changedOptions);

        console.log(changes.length > 0 ? `Packages with changes:\n${changes.join("\n")}` : "No changes detected!");
    }

    public static async publish(tag: string = "latest", options: Options & PublishOptions = { }): Promise<void>
    {
        const publishOptions: Required<PublishOptions> =
        {
            build:                options.build!,
            canary:               options.canary!,
            force:                options.force!,
            ignoreChanges:        options.ignoreChanges!,
            includePrivate:       options.includePrivate!,
            includeWorkspaceRoot: options.includeWorkspaceRoot!,
            preid:                options.preid!,
            prereleaseType:       options.prereleaseType!,
            synchronize:          options.synchronize!,
        };

        await new Publisher(options).publish(tag ?? options.canary ? "next" : "latest", publishOptions);
    }

    public static async unpublish(tag: string = "latest", options: Options & UnpublishOptions = { }): Promise<void>
    {
        const unpublishOptions: Required<UnpublishOptions> =
        {
            includePrivate:       options.includePrivate!,
            includeWorkspaceRoot: options.includeWorkspaceRoot!,
        };

        await new Publisher(options).unpublish(tag, unpublishOptions);
    }
}
