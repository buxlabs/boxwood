const { equal } = require('assert')
const compile = require('../helpers/compile')
const escape = require('escape-html')

console.time('modifiers')

equal(compile('{"Hello World" | uppercase}')({}, escape), 'HELLO WORLD')
equal(compile('{foo | uppercase}')({ foo: 'bar' }, escape), 'BAR')
equal(compile('<div html="{foo | uppercase}"></div>')({ foo: 'bar' }), '<div>BAR</div>')
equal(compile('<div text="{foo | uppercase}"></div>')({ foo: 'bar' }, escape), '<div>BAR</div>')
equal(compile('<div class="{foo | uppercase}"></div>')({ foo: 'bar' }, escape), '<div class="BAR"></div>')
equal(compile('<input checked="{query | trim}">')({ query: '' }, escape), '<input>')
equal(compile('<input checked="{query | trim}">')({ query: '   ' }, escape), '<input>')
equal(compile('<input checked="{query | trim}">')({ query: 'bar' }, escape), '<input checked>')
equal(compile('{foo | whitespacestrip}')({ foo: 'b  ar' }, escape), 'bar')
equal(compile('{foo | uppercase}')({ foo: 'bar' }, escape), 'BAR')
equal(compile('{foo | upcase}')({ foo: 'bar' }, escape), 'BAR')
equal(compile('{foo | lowercase}')({ foo: 'BAR' }, escape), 'bar')
equal(compile('{foo | downcase}')({ foo: 'BAR' }, escape), 'bar')
equal(compile('{foo | dasherize}')({ foo: 'foo_bar' }, escape), 'foo-bar')
equal(compile('{foo | constantize}')({ foo: 'bar' }, escape), 'BAR')
equal(compile('{foo | underscore}')({ foo: 'foo-bar' }, escape), 'foo_bar')
equal(compile('{foo | capitalize}')({ foo: 'bar' }, escape), 'Bar')
equal(compile('{foo | unescape}')({ foo: '&amp;' }, escape), '&')
equal(compile('{foo | unescape}')({ foo: '&amp;' }, escape), '&')
equal(compile('{foo | lowerfirst}')({ foo: 'FOO' }, escape), 'fOO')
equal(compile('{foo | uncapitalize}')({ foo: 'FOO' }, escape), 'fOO')
equal(compile('{foo | humanize}')({ foo: 'foo_bar' }, escape), 'Foo bar')
equal(compile('{foo | titleize}')({ foo: 'foo bar' }, escape), 'Foo Bar')
equal(compile('{foo | titlecase}')({ foo: 'foo bar' }, escape), 'Foo Bar')
equal(compile('{foo | classify}')({ foo: 'foobar' }, escape), 'Foobar')
equal(compile('{foo | pluralize}')({ foo: 'word' }, escape), 'words')
equal(compile('{foo | singularize}')({ foo: 'words' }, escape), 'word')
equal(compile('{foo | swapcase}')({ foo: 'BaR' }, escape), 'bAr')
equal(compile('{foo | camelize}')({ foo: 'bar_baz' }, escape), 'barBaz')
equal(compile('{foo | singlespace}')({ foo: 'bar   baz' }, escape), 'bar baz')
equal(compile('{foo | repeat(2)}')({ foo: 'fooBar' }, escape), 'fooBarfooBar')
equal(compile('{foo | summarize(3)}')({ foo: 'foo bar' }, escape), 'foo bar...')
equal(compile(`{foo | wrap('"')}`)({ foo: 'foo bar' }, escape), '"foo bar"')
equal(compile(`{foo | wrap('„', '”')}`)({ foo: 'foo bar' }, escape), '„foo bar”')
equal(compile(`{foo | unwrap('"')}`)({ foo: '"foo bar"' }, escape), 'foo bar')
equal(compile(`{foo | unwrap('„', '”')}`)({ foo: '„foo bar”' }, escape), 'foo bar')
equal(compile(`{foo | quote}`)({ foo: 'foo bar' }, escape), '"foo bar"')
equal(compile(`{foo | quote('pl')}`)({ foo: 'foo bar' }, escape), '„foo bar”')
equal(compile(`{foo | unquote}`)({ foo: '„foo bar”' }, escape), 'foo bar')
equal(compile(`{foo | unquote}`)({ foo: '"foo bar"' }, escape), 'foo bar')
equal(compile(`{foo | replace('bar', 'baz')}`)({ foo: 'foo baz' }, escape), 'foo baz')
equal(compile(`{foo | replace(${/\s/g},'')}`)({ foo: 'foo baz' }, escape), 'foobaz')
equal(compile(`{foo | strip}`)({ foo: ' foo baz ' }, escape), 'foo baz')
equal(compile(`{foo | strip('baz')}`)({ foo: 'foo baz' }, escape), 'foo')
equal(compile(`{foo | strip('o')}`)({ foo: 'foo' }, escape), 'f')
equal(compile(`{foo | strip(['o', 'a'])}`)({ foo: 'foo bar' }, escape), 'f br')
equal(compile(`{foo | squeeze}`)({ foo: 'yellow moon' }, escape), 'yelow mon')
equal(compile(`{foo | squeeze('a-o')}`)({ foo: 'foo baar baazz  ban' }, escape), 'fo bar bazz ban')
equal(compile(`{foo | index('ello')}`)({ foo: 'hello world' }, escape), '1')
equal(compile(`{foo | chop}`)({ foo: 'foo barz' }, escape), 'foo bar')
equal(compile(`{foo | chomp('barz') | trim}`)({ foo: 'foo barz' }, escape), 'foo')
equal(compile(`{foo | dot}`)({ foo: 'foo bar ban' }, escape), 'foo bar ban.')
equal(compile(`{foo | crop(10)}`)({ foo: 'foo bar ban baz' }, escape), 'foo bar...')
equal(compile(`{foo | slugify('_')}`)({ foo: 'loremIpsum dolor $pec!al chars' }, escape), 'loremipsum_dolor_pecal_chars')
equal(compile(`{foo | hyphenate}`)({ foo: '%# lorem ipsum  ? $  dolor' }, escape), 'lorem-ipsum-dolor')
equal(compile(`{foo | initials}`)({ foo: 'Foo Bar' }, escape), 'FB')
equal(compile(`{foo | initials(".")}`)({ foo: 'Foo Bar' }, escape), 'F.B')
equal(compile(`{foo | tail}`)({ foo: 'Lorem ipsum dolor sit amet, consectetur' }, escape), '...dolor sit amet, consectetur')
equal(compile(`{foo | htmlstrip}`)({ foo: 'Hello <b><i>world!</i></b>'}, escape), 'Hello world!')
equal(compile('{foo | abs}')({ foo: -1 }, escape), '1')
equal(compile('{foo | ceil}')({ foo: 1.6 }, escape), '2')
equal(compile('{foo | floor}')({ foo: 1.6 }, escape), '1')
equal(compile('{foo | round}')({ foo: 1.4 }, escape), '1')
equal(compile('{foo | round}')({ foo: 1.6 }, escape), '2')
equal(compile('{foo | factorial}')({ foo: 3 }, escape), '6')
equal(compile('{foo | square}')({ foo: 4 }, escape), '16')
equal(compile('{foo | trunc}')({ foo: 13.33 }, escape), '13')
equal(compile('{foo | pow(3)}')({ foo: 2 }, escape), '8')
equal(compile('{foo | truncate(6)}')({ foo: 'foobarbaz' }, escape), 'foo...')
equal(compile('{foo | abbreviate(6)}')({ foo: 'foobarbaz' }, escape), 'foo...')
equal(compile('{foo | pad("0")}')({ foo: 'foo\nbar' }, escape), '0foo\n0bar')
equal(compile('{foo | max}')({ foo: [1, 2, 3] }, escape), '3')
equal(compile('{foo | min}')({ foo: [1, 2, 3] }, escape), '1')
equal(compile('{foo | sqrt}')({ foo: 4 }, escape), '2')
equal(compile('{foo | add(10)}')({ foo: 5 }, escape), 15)
equal(compile('{foo | plus(10)}')({ foo: 5 }, escape), 15)
equal(compile('{foo | subtract(10)}')({ foo: 5 }, escape), -5)
equal(compile('{foo | minus(10)}')({ foo: 5 }, escape), -5)
equal(compile('{foo | multiply(10)}')({ foo: 5 }, escape), 50)
equal(compile('{foo | divide(10)}')({ foo: 5 }, escape), 1 / 2)
equal(compile('{foo | modulo(10)}')({ foo: 5 }, escape), 5)
equal(compile('{foo | increment}')({ foo: 5 }, escape), 6)
equal(compile('{foo | decrement}')({ foo: 5 }, escape), 4)
equal(compile('{foo | clamp(2, 8)}')({ foo: 10 }, escape), 8)
equal(compile('{foo | clamp(2, 8)}')({ foo: 6 }, escape), 6)
equal(compile('{foo | int}')({ foo: 10 }, escape), 10)
equal(compile('{foo | float}')({ foo: 10.25 }, escape), 10.25)
equal(compile('{foo | percentage}')({ foo: 0.25 }, escape), '25%')
equal(compile('{foo | fixed}')({ foo: 10.5 }, escape), '11')
equal(compile('{foo | fixed(2)}')({ foo: 100.521 }, escape), '100.52')
equal(compile('{foo | monetize}')({ foo: 25 }, escape), '25,00 zł')
equal(compile('{foo | reverse}')({ foo: 'bar' }, escape), 'rab')
equal(compile('{foo | rotate}')({ foo: 'bar' }, escape), 'bar')
equal(compile('{foo | rotate(1)}')({ foo: [1, 2, 3] }, escape), [2, 3, 1])
equal(compile('{foo | reverse}')({ foo: [1, 2, 3, 4] }, escape), [4, 3, 2, 1])
equal(compile('{foo | size}')({ foo: 'bar' }, escape), '3')
equal(compile('{foo | size}')({ foo: [1, 2] }, escape), '2')
equal(compile('{foo | size}')({ foo: new Set([1, 2, 3]) }, escape), '3')
equal(compile('{foo | count}')({ foo: 'bar' }, escape), '3')
equal(compile('{foo | count}')({ foo: [1, 2] }, escape), '2')
equal(compile('{foo | count}')({ foo: new Set([1, 2, 3]) }, escape), '3')
equal(compile('{foo | length}')({ foo: 'bar' }, escape), '3')
equal(compile('{foo | length}')({ foo: [1, 2] }, escape), '2')
equal(compile('{foo | length}')({ foo: new Set([1, 2, 3]) }, escape), '3')
equal(compile('{foo | drop(2)}')({ foo: [1, 2, 3 ,4] }, escape), [3, 4])
equal(compile('{foo | take(2)}')({ foo: [1, 2, 3 ,4] }, escape), [1, 2])
equal(compile('{foo | slice(2,4)}')({ foo: [1, 2, 3 ,4] }, escape), [3, 4])
equal(compile('{foo | json}')({ foo: { bar: 'baz' } }, escape), '{\n  "bar": "baz"\n}')
equal(compile('{foo | json(4)}')({ foo: { bar: 'baz' } }, escape), '{\n    "bar": "baz"\n}')
equal(compile('{foo | inspect}')({ foo: { bar: 'baz' } }, escape), '{\n  "bar": "baz"\n}')
equal(compile('{foo | inspect(4)}')({ foo: { bar: 'baz' } }, escape), '{\n    "bar": "baz"\n}')
equal(compile('{foo | prettify}')({ foo: { bar: 'baz' } }, escape), '{\n  "bar": "baz"\n}')
equal(compile('{foo | prettify(4)}')({ foo: { bar: 'baz' } }, escape), '{\n    "bar": "baz"\n}')
equal(compile('{foo | prettify}')({ foo: '{"bar": "baz"}' }, escape), '{\n  "bar": "baz"\n}')
equal(compile('{foo | prettify(4)}')({ foo: '{"bar": "baz"}' }, escape), '{\n    "bar": "baz"\n}')
equal(compile('{foo | first}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '1')
equal(compile('{foo | second}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '2')
equal(compile('{foo | third}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '3')
equal(compile('{foo | fourth}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '4')
equal(compile('{foo | fifth}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '5')
equal(compile('{foo | sixth}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '6')
equal(compile('{foo | seventh}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '7')
equal(compile('{foo | eigth}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '8')
equal(compile('{foo | ninth}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '9')
equal(compile('{foo | tenth}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '10')
equal(compile('{foo | last}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '10')
equal(compile('{foo | first}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '1')
equal(compile('{foo | second}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '2')
equal(compile('{foo | third}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '3')
equal(compile('{foo | fourth}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '4')
equal(compile('{foo | fifth}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '5')
equal(compile('{foo | sixth}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '6')
equal(compile('{foo | seventh}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '7')
equal(compile('{foo | eigth}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '8')
equal(compile('{foo | ninth}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '9')
equal(compile('{foo | tenth}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '10')
equal(compile('{foo | last}')({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '10')
equal(compile('{foo | sum}')({ foo: [1, 5, 18] }, escape), '24')
equal(compile('{foo | average}')({ foo: [1, 5, 18] }, escape), '8')
equal(compile('{foo | mean}')({ foo: [1, 5, 18] }, escape), '8')
equal(compile('{foo | median}')({ foo: [18, 5, 1] }, escape), '5')
equal(compile('{foo | sample}')({ foo: [1] }, escape), '1')
equal(compile('{foo | nth(-5)}')({ foo: [1, 2, 3, 4, 5] }, escape), '1')
equal(compile('{foo | nth(3)}')({ foo: [1, 2, 3, 4, 5] }, escape), '3')
equal(compile('{foo | unique}')({ foo: [1, 1, 2, 10, 2, 33] }, escape), [1, 2, 10, 33])
equal(compile('{foo | compact}')({ foo: [0, 1, false, 2, '', 3] }, escape), [1, 2, 3])
equal(compile('{foo | split(",")}')({ foo: 'foo,bar' }, escape), ['foo', 'bar'])
equal(compile('{foo | split(",") | first}')({ foo: 'foo,bar' }, escape), 'foo')
equal(compile('{foo | split(",") | second}')({ foo: 'foo,bar' }, escape), 'bar')
equal(compile('{foo | dig("bar.baz")}')({ foo: { bar: {} } }, escape), 'null')
equal(compile('{foo | dig("bar.baz")}')({ foo: { bar: { baz: 'qux' } } }, escape), 'qux')
equal(compile('{foo | format}')({ foo: new Date('2018/05/25') }, escape), '25-05-2018')
equal(compile('{foo | format("DD.MM.YYYY")}')({ foo: new Date('2018-05-25') }, escape), '25.05.2018')
equal(compile('{foo | format("MM.YYYY")}')({ foo: '2018/05/25' }, escape), '05.2018')
equal(compile('{foo | day}')({ foo: new Date('2018/05/29') }, escape), 29)
equal(compile('{foo | weekday}')({ foo: new Date('2018-05-29') }, escape), 2)
equal(compile('{foo | month}')({ foo: '2018/05/29' }, escape), 4)
equal(compile('{foo | year}')({ foo: '2018/05/29' }, escape), 2018)
equal(compile('{foo | prettydate}')({ foo: new Date(2018, 5, 29) }, escape), 'Friday, 29th of June 2018')
equal(compile('{foo | prettydate}')({ foo: new Date(2018, 5, 29) }, escape), 'Friday, 29th of June 2018')
equal(compile('{foo | prettydate}')({ foo: new Date(2018, 5, 29) }, escape), 'Friday, 29th of June 2018')
equal(compile('{foo | timestamp}')({ foo: new Date(2018, 5, 29) }, escape), '2018-06-29')
equal(compile('{foo | timestamp("YYYY/MM/DD")}')({ foo: new Date(2018, 5, 29) }, escape), '2018/06/29')
equal(compile('{foo | celsius}')({ foo: '70°F' }, escape), '21°C')
equal(compile('{foo | fahrenheit}')({ foo: '21°C' }, escape), '70°F')
equal(compile('{foo | kelvin}')({ foo: '70°F' }, escape), '294K')
equal(compile('{new Date(2018, 5, 29) | prettydate}')({}, escape), 'Friday, 29th of June 2018')
equal(compile('{new Date(foo, bar, baz) | prettydate}')({ foo: 2018, bar: 5, baz: 29 }, escape), 'Friday, 29th of June 2018')
equal(compile('{photos | first | dig("src")}')({
  photos: [ { size: '100', src: 'baz' }, { size: '200', src: 'qux' } ]
}, escape), 'baz')
equal(compile('{foo | first | dig("foo.bar.baz")}')({
  foo: [ { foo: { bar: { baz: 'qux' } } }, { foo: { bar: { baz: 'quux' } } } ]
}, escape), 'qux')
equal(compile('{foo | values }')({
  foo: { bar: 1, baz: 2, ban: 'qux' }
}, escape), [1, 2, 'qux'])
equal(compile('{foo | values | first}')({
  foo: { bar: 1, baz: 2, ban: 'qux' }
}, escape), '1')
equal(compile('{foo | keys }')({
  foo: { bar: 1, baz: 2, ban: 'qux' }
}, escape), ['bar', 'baz', 'ban'])
equal(compile('{foo | keys | last}')({
  foo: { bar: 1, baz: 2, ban: 'qux' }
}, escape), 'ban')
equal(compile('{foo | monetize({ symbol: "$", ending: false, space: false , separator: "."})}')({foo: 100}, escape), '$100.00')

equal(compile(`<img class="img-responsive" src="/assets/images/{photos | first}" alt="Photo">`, {})({
  photos: ['foo.jpg', 'bar.jpg']
}, escape), `<img class="img-responsive" src="/assets/images/foo.jpg" alt="Photo">`)

equal(compile(`<img class="img-responsive" src="/assets/images/{photos | first}" alt="Photo">`, {})({
  photos: ['foo.jpg', 'bar.jpg']
}, escape), `<img class="img-responsive" src="/assets/images/foo.jpg" alt="Photo">`)

console.timeEnd('modifiers')