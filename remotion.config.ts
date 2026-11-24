import {Config} from '@remotion/cli/config';
Config.setBrowserExecutable(process.env.CHROME_PATH || '/usr/bin/google-chrome');
Config.setChromiumOpenGlRenderer('swangle');
