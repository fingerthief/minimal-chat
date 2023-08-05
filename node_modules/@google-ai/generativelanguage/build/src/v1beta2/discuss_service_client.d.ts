import type * as gax from 'google-gax';
import type { Callback, CallOptions, Descriptors, ClientOptions } from 'google-gax';
import * as protos from '../../protos/protos';
/**
 *  An API for using Generative Language Models (GLMs) in dialog applications.
 *
 *  Also known as large language models (LLMs), this API provides models that
 *  are trained for multi-turn dialog.
 * @class
 * @memberof v1beta2
 */
export declare class DiscussServiceClient {
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
    discussServiceStub?: Promise<{
        [name: string]: Function;
    }>;
    /**
     * Construct an instance of DiscussServiceClient.
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
     *     const client = new DiscussServiceClient({fallback: 'rest'}, gax);
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
     * Generates a response from the model given an input `MessagePrompt`.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.model
     *   Required. The name of the model to use.
     *
     *   Format: `name=models/{model}`.
     * @param {google.ai.generativelanguage.v1beta2.MessagePrompt} request.prompt
     *   Required. The structured textual input given to the model as a prompt.
     *
     *   Given a
     *   prompt, the model will return what it predicts is the next message in the
     *   discussion.
     * @param {number} [request.temperature]
     *   Optional. Controls the randomness of the output.
     *
     *   Values can range over `[0.0,1.0]`,
     *   inclusive. A value closer to `1.0` will produce responses that are more
     *   varied, while a value closer to `0.0` will typically result in
     *   less surprising responses from the model.
     * @param {number} [request.candidateCount]
     *   Optional. The number of generated response messages to return.
     *
     *   This value must be between
     *   `[1, 8]`, inclusive. If unset, this will default to `1`.
     * @param {number} [request.topP]
     *   Optional. The maximum cumulative probability of tokens to consider when
     *   sampling.
     *
     *   The model uses combined Top-k and nucleus sampling.
     *
     *   Nucleus sampling considers the smallest set of tokens whose probability
     *   sum is at least `top_p`.
     * @param {number} [request.topK]
     *   Optional. The maximum number of tokens to consider when sampling.
     *
     *   The model uses combined Top-k and nucleus sampling.
     *
     *   Top-k sampling considers the set of `top_k` most probable tokens.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing {@link google.ai.generativelanguage.v1beta2.GenerateMessageResponse | GenerateMessageResponse}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1beta2/discuss_service.generate_message.js</caption>
     * region_tag:generativelanguage_v1beta2_generated_DiscussService_GenerateMessage_async
     */
    generateMessage(request?: protos.google.ai.generativelanguage.v1beta2.IGenerateMessageRequest, options?: CallOptions): Promise<[
        protos.google.ai.generativelanguage.v1beta2.IGenerateMessageResponse,
        (protos.google.ai.generativelanguage.v1beta2.IGenerateMessageRequest | undefined),
        {} | undefined
    ]>;
    generateMessage(request: protos.google.ai.generativelanguage.v1beta2.IGenerateMessageRequest, options: CallOptions, callback: Callback<protos.google.ai.generativelanguage.v1beta2.IGenerateMessageResponse, protos.google.ai.generativelanguage.v1beta2.IGenerateMessageRequest | null | undefined, {} | null | undefined>): void;
    generateMessage(request: protos.google.ai.generativelanguage.v1beta2.IGenerateMessageRequest, callback: Callback<protos.google.ai.generativelanguage.v1beta2.IGenerateMessageResponse, protos.google.ai.generativelanguage.v1beta2.IGenerateMessageRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Runs a model's tokenizer on a string and returns the token count.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.model
     *   Required. The model's resource name. This serves as an ID for the Model to
     *   use.
     *
     *   This name should match a model name returned by the `ListModels` method.
     *
     *   Format: `models/{model}`
     * @param {google.ai.generativelanguage.v1beta2.MessagePrompt} request.prompt
     *   Required. The prompt, whose token count is to be returned.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing {@link google.ai.generativelanguage.v1beta2.CountMessageTokensResponse | CountMessageTokensResponse}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1beta2/discuss_service.count_message_tokens.js</caption>
     * region_tag:generativelanguage_v1beta2_generated_DiscussService_CountMessageTokens_async
     */
    countMessageTokens(request?: protos.google.ai.generativelanguage.v1beta2.ICountMessageTokensRequest, options?: CallOptions): Promise<[
        protos.google.ai.generativelanguage.v1beta2.ICountMessageTokensResponse,
        (protos.google.ai.generativelanguage.v1beta2.ICountMessageTokensRequest | undefined),
        {} | undefined
    ]>;
    countMessageTokens(request: protos.google.ai.generativelanguage.v1beta2.ICountMessageTokensRequest, options: CallOptions, callback: Callback<protos.google.ai.generativelanguage.v1beta2.ICountMessageTokensResponse, protos.google.ai.generativelanguage.v1beta2.ICountMessageTokensRequest | null | undefined, {} | null | undefined>): void;
    countMessageTokens(request: protos.google.ai.generativelanguage.v1beta2.ICountMessageTokensRequest, callback: Callback<protos.google.ai.generativelanguage.v1beta2.ICountMessageTokensResponse, protos.google.ai.generativelanguage.v1beta2.ICountMessageTokensRequest | null | undefined, {} | null | undefined>): void;
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
