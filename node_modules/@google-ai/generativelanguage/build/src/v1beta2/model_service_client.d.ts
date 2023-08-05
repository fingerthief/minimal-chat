/// <reference types="node" />
import type * as gax from 'google-gax';
import type { Callback, CallOptions, Descriptors, ClientOptions, PaginationCallback } from 'google-gax';
import { Transform } from 'stream';
import * as protos from '../../protos/protos';
/**
 *  Provides methods for getting metadata information about Generative Models.
 * @class
 * @memberof v1beta2
 */
export declare class ModelServiceClient {
    private _terminated;
    private _opts;
    private _providedCustomServicePath;
    private _gaxModule;
    private _gaxGrpc;
    private _protos;
    private _defaults;
    auth: gax.GoogleAuth;
    descriptors: Descriptors;
    warn: (code: string, message: string, warnType?: string) => void;
    innerApiCalls: {
        [name: string]: Function;
    };
    pathTemplates: {
        [name: string]: gax.PathTemplate;
    };
    modelServiceStub?: Promise<{
        [name: string]: Function;
    }>;
    /**
     * Construct an instance of ModelServiceClient.
     *
     * @param {object} [options] - The configuration object.
     * The options accepted by the constructor are described in detail
     * in [this document](https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#creating-the-client-instance).
     * The common options are:
     * @param {object} [options.credentials] - Credentials object.
     * @param {string} [options.credentials.client_email]
     * @param {string} [options.credentials.private_key]
     * @param {string} [options.email] - Account email address. Required when
     *     using a .pem or .p12 keyFilename.
     * @param {string} [options.keyFilename] - Full path to the a .json, .pem, or
     *     .p12 key downloaded from the Google Developers Console. If you provide
     *     a path to a JSON file, the projectId option below is not necessary.
     *     NOTE: .pem and .p12 require you to specify options.email as well.
     * @param {number} [options.port] - The port on which to connect to
     *     the remote host.
     * @param {string} [options.projectId] - The project ID from the Google
     *     Developer's Console, e.g. 'grape-spaceship-123'. We will also check
     *     the environment variable GCLOUD_PROJECT for your project ID. If your
     *     app is running in an environment which supports
     *     {@link https://developers.google.com/identity/protocols/application-default-credentials Application Default Credentials},
     *     your project ID will be detected automatically.
     * @param {string} [options.apiEndpoint] - The domain name of the
     *     API remote host.
     * @param {gax.ClientConfig} [options.clientConfig] - Client configuration override.
     *     Follows the structure of {@link gapicConfig}.
     * @param {boolean | "rest"} [options.fallback] - Use HTTP fallback mode.
     *     Pass "rest" to use HTTP/1.1 REST API instead of gRPC.
     *     For more information, please check the
     *     {@link https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#http11-rest-api-mode documentation}.
     * @param {gax} [gaxInstance]: loaded instance of `google-gax`. Useful if you
     *     need to avoid loading the default gRPC version and want to use the fallback
     *     HTTP implementation. Load only fallback version and pass it to the constructor:
     *     ```
     *     const gax = require('google-gax/build/src/fallback'); // avoids loading google-gax with gRPC
     *     const client = new ModelServiceClient({fallback: 'rest'}, gax);
     *     ```
     */
    constructor(opts?: ClientOptions, gaxInstance?: typeof gax | typeof gax.fallback);
    /**
     * Initialize the client.
     * Performs asynchronous operations (such as authentication) and prepares the client.
     * This function will be called automatically when any class method is called for the
     * first time, but if you need to initialize it before calling an actual method,
     * feel free to call initialize() directly.
     *
     * You can await on this method if you want to make sure the client is initialized.
     *
     * @returns {Promise} A promise that resolves to an authenticated service stub.
     */
    initialize(): Promise<{
        [name: string]: Function;
    }>;
    /**
     * The DNS address for this API service.
     * @returns {string} The DNS address for this service.
     */
    static get servicePath(): string;
    /**
     * The DNS address for this API service - same as servicePath(),
     * exists for compatibility reasons.
     * @returns {string} The DNS address for this service.
     */
    static get apiEndpoint(): string;
    /**
     * The port for this API service.
     * @returns {number} The default port for this service.
     */
    static get port(): number;
    /**
     * The scopes needed to make gRPC calls for every method defined
     * in this service.
     * @returns {string[]} List of default scopes.
     */
    static get scopes(): never[];
    getProjectId(): Promise<string>;
    getProjectId(callback: Callback<string, undefined, undefined>): void;
    /**
     * Gets information about a specific Model.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.name
     *   Required. The resource name of the model.
     *
     *   This name should match a model name returned by the `ListModels` method.
     *
     *   Format: `models/{model}`
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing {@link google.ai.generativelanguage.v1beta2.Model | Model}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1beta2/model_service.get_model.js</caption>
     * region_tag:generativelanguage_v1beta2_generated_ModelService_GetModel_async
     */
    getModel(request?: protos.google.ai.generativelanguage.v1beta2.IGetModelRequest, options?: CallOptions): Promise<[
        protos.google.ai.generativelanguage.v1beta2.IModel,
        protos.google.ai.generativelanguage.v1beta2.IGetModelRequest | undefined,
        {} | undefined
    ]>;
    getModel(request: protos.google.ai.generativelanguage.v1beta2.IGetModelRequest, options: CallOptions, callback: Callback<protos.google.ai.generativelanguage.v1beta2.IModel, protos.google.ai.generativelanguage.v1beta2.IGetModelRequest | null | undefined, {} | null | undefined>): void;
    getModel(request: protos.google.ai.generativelanguage.v1beta2.IGetModelRequest, callback: Callback<protos.google.ai.generativelanguage.v1beta2.IModel, protos.google.ai.generativelanguage.v1beta2.IGetModelRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Lists models available through the API.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {number} request.pageSize
     *   The maximum number of `Models` to return (per page).
     *
     *   The service may return fewer models.
     *   If unspecified, at most 50 models will be returned per page.
     *   This method returns at most 1000 models per page, even if you pass a larger
     *   page_size.
     * @param {string} request.pageToken
     *   A page token, received from a previous `ListModels` call.
     *
     *   Provide the `page_token` returned by one request as an argument to the next
     *   request to retrieve the next page.
     *
     *   When paginating, all other parameters provided to `ListModels` must match
     *   the call that provided the page token.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is Array of {@link google.ai.generativelanguage.v1beta2.Model | Model}.
     *   The client library will perform auto-pagination by default: it will call the API as many
     *   times as needed and will merge results from all the pages into this array.
     *   Note that it can affect your quota.
     *   We recommend using `listModelsAsync()`
     *   method described below for async iteration which you can stop as needed.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
     *   for more details and examples.
     */
    listModels(request?: protos.google.ai.generativelanguage.v1beta2.IListModelsRequest, options?: CallOptions): Promise<[
        protos.google.ai.generativelanguage.v1beta2.IModel[],
        protos.google.ai.generativelanguage.v1beta2.IListModelsRequest | null,
        protos.google.ai.generativelanguage.v1beta2.IListModelsResponse
    ]>;
    listModels(request: protos.google.ai.generativelanguage.v1beta2.IListModelsRequest, options: CallOptions, callback: PaginationCallback<protos.google.ai.generativelanguage.v1beta2.IListModelsRequest, protos.google.ai.generativelanguage.v1beta2.IListModelsResponse | null | undefined, protos.google.ai.generativelanguage.v1beta2.IModel>): void;
    listModels(request: protos.google.ai.generativelanguage.v1beta2.IListModelsRequest, callback: PaginationCallback<protos.google.ai.generativelanguage.v1beta2.IListModelsRequest, protos.google.ai.generativelanguage.v1beta2.IListModelsResponse | null | undefined, protos.google.ai.generativelanguage.v1beta2.IModel>): void;
    /**
     * Equivalent to `method.name.toCamelCase()`, but returns a NodeJS Stream object.
     * @param {Object} request
     *   The request object that will be sent.
     * @param {number} request.pageSize
     *   The maximum number of `Models` to return (per page).
     *
     *   The service may return fewer models.
     *   If unspecified, at most 50 models will be returned per page.
     *   This method returns at most 1000 models per page, even if you pass a larger
     *   page_size.
     * @param {string} request.pageToken
     *   A page token, received from a previous `ListModels` call.
     *
     *   Provide the `page_token` returned by one request as an argument to the next
     *   request to retrieve the next page.
     *
     *   When paginating, all other parameters provided to `ListModels` must match
     *   the call that provided the page token.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Stream}
     *   An object stream which emits an object representing {@link google.ai.generativelanguage.v1beta2.Model | Model} on 'data' event.
     *   The client library will perform auto-pagination by default: it will call the API as many
     *   times as needed. Note that it can affect your quota.
     *   We recommend using `listModelsAsync()`
     *   method described below for async iteration which you can stop as needed.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
     *   for more details and examples.
     */
    listModelsStream(request?: protos.google.ai.generativelanguage.v1beta2.IListModelsRequest, options?: CallOptions): Transform;
    /**
     * Equivalent to `listModels`, but returns an iterable object.
     *
     * `for`-`await`-`of` syntax is used with the iterable to get response elements on-demand.
     * @param {Object} request
     *   The request object that will be sent.
     * @param {number} request.pageSize
     *   The maximum number of `Models` to return (per page).
     *
     *   The service may return fewer models.
     *   If unspecified, at most 50 models will be returned per page.
     *   This method returns at most 1000 models per page, even if you pass a larger
     *   page_size.
     * @param {string} request.pageToken
     *   A page token, received from a previous `ListModels` call.
     *
     *   Provide the `page_token` returned by one request as an argument to the next
     *   request to retrieve the next page.
     *
     *   When paginating, all other parameters provided to `ListModels` must match
     *   the call that provided the page token.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Object}
     *   An iterable Object that allows [async iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).
     *   When you iterate the returned iterable, each element will be an object representing
     *   {@link google.ai.generativelanguage.v1beta2.Model | Model}. The API will be called under the hood as needed, once per the page,
     *   so you can stop the iteration when you don't need more results.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1beta2/model_service.list_models.js</caption>
     * region_tag:generativelanguage_v1beta2_generated_ModelService_ListModels_async
     */
    listModelsAsync(request?: protos.google.ai.generativelanguage.v1beta2.IListModelsRequest, options?: CallOptions): AsyncIterable<protos.google.ai.generativelanguage.v1beta2.IModel>;
    /**
     * Return a fully-qualified model resource name string.
     *
     * @param {string} model
     * @returns {string} Resource name string.
     */
    modelPath(model: string): string;
    /**
     * Parse the model from Model resource.
     *
     * @param {string} modelName
     *   A fully-qualified path representing Model resource.
     * @returns {string} A string representing the model.
     */
    matchModelFromModelName(modelName: string): string | number;
    /**
     * Terminate the gRPC channel and close the client.
     *
     * The client will no longer be usable and all future behavior is undefined.
     * @returns {Promise} A promise that resolves when the client is closed.
     */
    close(): Promise<void>;
}
