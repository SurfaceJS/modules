import Mock from "@surface/mock";

const mocks = new WeakMap<object, Mock<object>>();

function mockFrom(target: object): object
{
    let mock = mocks.get(target);

    if (!mock)
    {
        mocks.set(target, mock = new Mock(target));
    }

    return mock.proxy;
}

export default function createProxy(target: object): object
{
    const handler: ProxyHandler<object> =
    {
        get(target, key, receiver)
        {
            const value = Reflect.get(target, key, receiver);

            if (value instanceof Object)
            {
                return mockFrom(value);
            }

            return value;
        },
    };

    return new Proxy(target, handler);
}