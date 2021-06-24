import { NextRouter, useRouter, Router } from 'next/router';

export class RouteService {
    route: NextRouter;
    constructor() {
        this.route = useRouter();
        this.initialize();
    }

    private initialize() {
        console.log(this.route);
        Router.events.on('routeChangeComplete', (url, ...args) => {
            console.log('on route change complete',url, args, this.route);
        });
        // this.route.beforePopState((state) => {
        //     const url = state.url;
        //     console.log(url);
        //     return true;
        // });
    }

}