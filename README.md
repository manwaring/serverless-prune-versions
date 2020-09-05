<p align="center">
  <img height="150" src="https://d1wzvcwrgjaybe.cloudfront.net/repos/manwaring/serverless-prune-versions/readme-category-icon.png">
  <img height="150" src="https://d1wzvcwrgjaybe.cloudfront.net/repos/manwaring/serverless-prune-versions/readme-repo-icon.png">
</p>

<p align="center">
  <a href="https://npmjs.com/package/serverless-prune-versions">
    <img src="https://flat.badgen.net/npm/v/serverless-prune-versions?icon=npm&label=npm@latest"></a>
  <a href="https://www.npmjs.com/package/serverless-prune-versions">
    <img src="https://flat.badgen.net/npm/dt/serverless-prune-versions?icon=npm"></a>
  <a href="https://codecov.io/gh/manwaring/serverless-prune-versions">
    <img src="https://flat.badgen.net/codecov/c/github/manwaring/serverless-prune-versions/?icon=codecov"></a>
  <a href="https://packagephobia.now.sh/result?p=@manwaring/serverless-prune-versions">
    <img src="https://flat.badgen.net/packagephobia/install/serverless-prune-versions"></a>
  <a href="https://www.npmjs.com/package/serverless-prune-versions">
    <img src="https://flat.badgen.net/npm/license/serverless-prune-versions"></a>
</p>

<p align="center">
  <a href="https://circleci.com/gh/manwaring/serverless-prune-versions">
    <img src="https://flat.badgen.net/circleci/github/manwaring/serverless-prune-versions/master?icon=circleci"></a>
  <a href="https://flat.badgen.net/dependabot/manwaring/serverless-prune-versions">
    <img src="https://flat.badgen.net/dependabot/manwaring/serverless-prune-versions/?icon=dependabot&label=dependabot"></a>
  <a href="https://david-dm.org/manwaring/serverless-prune-versions">
    <img src="https://flat.badgen.net/david/dep/manwaring/serverless-prune-versions"></a>
  <a href="https://david-dm.org/manwaring/serverless-prune-versions?type=dev">
    <img src="https://flat.badgen.net/david/dev/manwaring/serverless-prune-versions/?label=dev+dependencies"></a>
</p>

# Serverless prune versions

1. [Overview](#overview)
1. [Installation and setup](#installation-and-setup)
1. [Configuration](#configuration)

_Feedback appreciated! If you have an idea for how this plugin can be improved [please open an issue](https://github.com/manwaring/serverless-prune-versions/issues/new)._

# Overview

This plugin for the Serverless Framework removes old versions of AWS Lambda functions - important because if left to it's own devices each time the Serverless Framework is used to update your Lambda or Lambda Layer code in AWS it creates a new version.  But if you aren't using the old versions then no harm, no foul - right?  Unfortunately not, because for each and every version that's created AWS Lambda stores the source code used by that version for you - and there's a hard limit of only 75GB available per account for storage of this source code.  By removing old versions this plugin keeps you from hitting this storage limit, letting you worry about features instead of account limits.

# Installation and setup

Install the plugin as a dev dependency in your project

`npm i serverless-prune-versions -D` or `yarn add serverless-prune-versions -D`

Add the plugin to the `plugins` block of your `serverless.yml` file

```yml
plugins:
  - serverless-prune-versions
```

# Configuration

Because this plugin will delete deployed versions of your Lambda functions it is disabled by default and you must explicitly enable it.

This plugin uses the following default configuration

| Property       | Description                                                                        | Default value |
| -------------- | ---------------------------------------------------------------------------------- | ------------- |
| Automatic      | Boolean, should plugin run automatically post-deployment                           | `false`       |
| Include Layers | Boolean, should plugin remove Lambda Layer versions in addition to Lambda versions | `false`       |
| Number         | Numeric, how many versions to retain                                               | `5`           |


All properties can be changed by overriding values in the `custom` block of your `serverless.yml`.  In this example the plugin will automatically run after every deployment and will remove all Lambda and Lambda Layers except for the 3 most recent.

```yml
custom:
  prune:
    automatic: true
    includeLayers: true
    number: 3
```

This is the minimal configuration needed for the plugin to run automatically after every deployment - it will only remove Lambda versions (not Lambda Layer versions) and will retain the last 5 versions since those defaults weren't overriden.

```yml
custom:
  prune:
    automatic: true
```

<img height="0" src="https://b7z7o7y5fi.execute-api.us-east-1.amazonaws.com/v1/readme/visits/github/manwaring/serverless-prune-versions?style=flat-square">
