import type { PrereleaseTypes } from "@surface/core";
import { Version }              from "@surface/core";
import chalk                    from "chalk";
import type { IPackage }        from "npm-registry-client";
import Status                   from "./enums/status.js";
import StrategyType             from "./enums/strategy-type.js";
import NpmRepository            from "./npm-repository.js";

const blue      = chalk.rgb(0, 115, 230);
const darkGreen = chalk.rgb(0, 128, 0);
const green     = chalk.rgb(0, 255, 0);
const purple    = chalk.rgb(191, 0, 191);

export type Options =
{
    strategy?: StrategyType,
    silent?:   boolean,
    version?:  `${string}.${string}.${string}`,
};

export default class Depsync
{
    private readonly  updated:    Set<IPackage> = new Set();
    private readonly  lookup:     Map<string, IPackage>;
    private readonly  repository: NpmRepository;
    private readonly  silent:     boolean;
    private readonly  strategy:   StrategyType;
    private readonly  template?:  string;

    public constructor(repository: NpmRepository, lookup: Map<string, IPackage>, options?: Options)
    {
        this.repository = repository;
        this.lookup     = lookup;

        // c8 ignore next
        this.silent   = options?.silent   ?? false;
        // c8 ignore next
        this.strategy = options?.strategy ?? StrategyType.Default;
        // c8 ignore next
        this.template = options?.version;
    }

    // c8 ignore next
    public static async sync(lookup: Map<string, IPackage>, options?: Options): Promise<IPackage[]>
    {
        return new Depsync(new NpmRepository(), lookup, options).sync();
    }

    private applyPlaceholder(placeholder: string | undefined, value: string | undefined): string | undefined
    {
        return placeholder == "*" ? value : placeholder;
    }

    private parseTemplate(source: string, template: string): Version
    {
        type RawVersion = [string, string, string, string?, string?];

        const [templateMajor, templateMinor, templateRevision, templatePreReleaseType, templatePreReleaseVersion] = template.split("-").map(x => x.split("."))
            .flat() as RawVersion;

        const [sourceMajor, sourceMinor, sourceRevision, sourcePreReleaseType, sourcePreReleaseVersion] = source.split("-").map(x => x.split("."))
            .flat() as RawVersion;

        const major             = Number(this.applyPlaceholder(templateMajor, sourceMajor));
        const minor             = Number(this.applyPlaceholder(templateMinor, sourceMinor));
        const revision          = Number(this.applyPlaceholder(templateRevision, sourceRevision));
        const preReleaseType    = this.applyPlaceholder(templatePreReleaseType, sourcePreReleaseType) as PrereleaseTypes | undefined;
        const preReleaseVersion = this.applyPlaceholder(templatePreReleaseVersion, sourcePreReleaseVersion);

        const version = new Version(major, minor, revision);

        if (preReleaseType && preReleaseVersion)
        {
            version.prerelease = { type: preReleaseType, version: Number(preReleaseVersion) };
        }

        return version;
    }

    private async hasUpdate($package: IPackage): Promise<boolean>
    {
        if (this.template)
        {
            const targetVersion = this.parseTemplate($package.version, this.template);

            if (this.hasStrategies(StrategyType.ForceVersion) || Version.compare(targetVersion, Version.parse($package.version)) == 1)
            {
                if (!targetVersion.prerelease || !this.hasStrategies(StrategyType.OnlyStable))
                {
                    const actual = $package.version;

                    $package.version = targetVersion.toString();

                    // c8 ignore if
                    if (!this.silent)
                    {
                        console.log(`${chalk.bold.gray("[UPDATE]:")} ${blue($package.name)} - ${darkGreen(actual)} >> ${green($package.version)}`);
                    }
                }
            }
        }

        if (await this.repository.getStatus($package) != Status.InRegistry)
        {
            this.updated.add($package);

            return true;
        }

        return false;
    }

    private hasStrategies(...strategies: StrategyType[]): boolean
    {
        return strategies.every(x => (this.strategy & x) == x);
    }

    private async updateDependents($package: IPackage): Promise<void>
    {
        if (this.hasStrategies(StrategyType.OnlyStable) && Version.parse($package.version).prerelease)
        {
            return;
        }

        const dependentPackages = Array.from(this.lookup.values())
            .filter(x => !!x.dependencies?.[$package.name] && x.dependencies?.[$package.name] != $package.version);

        for (const dependent of dependentPackages)
        {
            const version = dependent.dependencies![$package.name];

            dependent.dependencies![$package.name] = $package.version;

            // c8 ignore if
            if (!this.silent)
            {
                console.log(`${chalk.bold.gray("[UPDATE]:")} ${blue($package.name)} dependency in ${blue(dependent.name)} - ${darkGreen(version)} >> ${green($package.version)}`);
            }

            if (!this.updated.has(dependent))
            {
                if (await this.repository.getStatus(dependent) == Status.InRegistry)
                {
                    this.update(dependent);
                }

                this.updated.add(dependent);

                await this.updateDependents(dependent);
            }
        }

        const devDependentPackages = Array.from(this.lookup.values())
            .filter(x => !!x.devDependencies?.[$package.name] && x.devDependencies?.[$package.name] != $package.version);

        for (const devDependent of devDependentPackages)
        {
            const version = devDependent.devDependencies![$package.name];

            devDependent.devDependencies![$package.name] = $package.version;

            // c8 ignore if
            if (!this.silent)
            {
                console.log(`${chalk.bold.gray("[UPDATE]:")} ${blue($package.name)} dev dependency in ${blue(devDependent.name)} - ${darkGreen(version)} >> ${green($package.version)}`);
            }

            if (!this.updated.has(devDependent))
            {
                this.updated.add(devDependent);

                await this.updateDependents(devDependent);
            }
        }
    }

    private update($package: IPackage): void
    {
        const version = Version.parse($package.version);

        if (version.prerelease)
        {
            version.prerelease.version++;
        }
        else
        {
            version.revision++;
        }

        const actual = $package.version;

        $package.version = version.toString();

        // c8 ignore if
        if (!this.silent)
        {
            console.log(`${chalk.bold.gray("[UPDATE]:")} ${blue($package.name)} - ${darkGreen(actual)} >> ${green($package.version)}`);
        }
    }

    public async sync(): Promise<IPackage[]>
    {
        // c8 ignore if
        if (this.template && !this.silent)
        {
            console.log(`[INFO]: Sync using target version ${purple(this.template)}`);
        }

        const packages = Array.from(this.lookup.values());

        const updateList = await Promise.all(packages.map(async x => ({ package: x, updated: await this.hasUpdate(x) })));

        if (!this.hasStrategies(StrategyType.IgnoreDependents))
        {
            for (const entry of updateList)
            {
                if (entry.updated)
                {
                    await this.updateDependents(entry.package);
                }
            }
        }

        return Array.from(this.updated.values());
    }
}