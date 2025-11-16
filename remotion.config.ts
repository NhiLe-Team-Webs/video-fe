/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(enableTailwind);
Config.setMaxTimelineTracks(500);

// Configure to handle file descriptor limits
Config.setChromiumOpenGlRenderer("egl");
Config.setChromiumDisableWebSecurity(true);
Config.setChromiumHeadlessMode(true);
Config.setConcurrency(1); // Reduce concurrency to prevent too many file handles
Config.setAudioCodec("aac");
Config.setAudioBitrate("128k");
