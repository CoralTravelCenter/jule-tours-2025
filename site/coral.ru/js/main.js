import {
	hostReactAppReady,
	vimeoAutoPlay,
} from "../../common/js/utils";

hostReactAppReady().then(() => {
	vimeoAutoPlay();
});
