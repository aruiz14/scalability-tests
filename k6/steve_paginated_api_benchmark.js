import { check, fail } from 'k6';
import http from 'k6/http';

// Parameters
const vus = __ENV.VUS || 1
const perVuIterations = __ENV.PER_VU_ITERATIONS || 30
const baseUrl = __ENV.BASE_URL
const username = __ENV.USERNAME
const password = __ENV.PASSWORD
const token = __ENV.TOKEN
const cluster = __ENV.CLUSTER || "local"
const resource = __ENV.RESOURCE || "management.cattle.io.setting"
const paginationStyle = __ENV.PAGINATION_STYLE || "k8s"

// Option setting
export const options = {
    insecureSkipTLSVerify: true,

    scenarios: {
        list : {
            executor: 'per-vu-iterations',
            exec: 'list',
            vus: vus,
            iterations: perVuIterations,
            maxDuration: '24h',
        }
    },
    thresholds: {
        checks: ['rate>0.99']
    }
}

// Test functions, in order of execution

export function setup() {
    // if session cookie was specified, save it
    if (token) {
        return {R_SESS: token}
    }

    // otherwise, log in
    const res = http.post(`${baseUrl}/v3-public/localProviders/local?action=login`, JSON.stringify({
        "description": "UI session",
        "responseType": "cookie",
        "username": username,
        "password": password
    }))

    check(res, {
        'logging in returns status 200': (r) => r.status === 200,
    })

    return http.cookieJar().cookiesForURL(res.url)
}

export function list(cookies) {
    const url = cluster === "local"?
        `${baseUrl}/v1/${resource}` :
        `${baseUrl}/k8s/clusters/${cluster}/v1/${resource}`

    if (paginationStyle === "k8s") {
        listWithK8sStylePagination(url, cookies)
    }
    else if (paginationStyle === "steve") {
        listWithSteveStylePagination(url, cookies)
    }
}

function listWithK8sStylePagination(url, cookies) {
    let revision = null
    let continueToken = null
    while (true) {
        const fullUrl = url + "?limit=100" +
            (revision != null ? "&revision=" + revision : "") +
            (continueToken != null ? "&continue=" + continueToken : "")

        const res = http.get(fullUrl, {cookies: cookies})

        const criterion = {}
        criterion[`listing ${resource} from cluster ${cluster} (k8s style pagination) returns status 200`] = (r) => r.status === 200
        check(res, criterion)

        try {
            const body = JSON.parse(res.body)
            if (body === undefined || body.continue === undefined) {
                break
            }
            if (revision == null) {
                revision = body.revision
            }
            continueToken = body.continue
        } catch (e) {
            if (e instanceof SyntaxError) {
                fail("Response body does not parse as JSON: " + res.body)
            }
            throw e
        }
    }
}

function listWithSteveStylePagination(url, cookies) {
    let revision = null
    let continueToken = null
    while (true) {
        const fullUrl = url + "?limit=100" +
            (revision != null ? "&revision=" + revision : "") +
            (continueToken != null ? "&continue=" + continueToken : "")

        const res = http.get(fullUrl, {cookies: cookies})

        const criterion = {}
        criterion[`listing ${resource} from cluster ${cluster} (steve style pagination) returns status 200`] = (r) => r.status === 200
        check(res, criterion)

        try {
            const body = JSON.parse(res.body)
            if (body === undefined || body.continue === undefined) {
                break
            }
            if (revision == null) {
                revision = body.revision
            }
            continueToken = body.continue
        }
        catch (e){
            if (e instanceof SyntaxError) {
                fail("Response body does not parse as JSON: " + res.body)
            }
            throw e
        }
    }
}
