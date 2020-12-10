const test = require('ava')
const { join } = require('path')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('filters', async assert => {
  var { template } = await compile('{"Hello World" | uppercase}')
  assert.deepEqual(template({}, escape), 'HELLO WORLD')

  var { template } = await compile('{foo | uppercase}')
  assert.deepEqual(template({ foo: 'bar' }, escape), 'BAR')

  var { template } = await compile('<div html="{foo | uppercase}"></div>')
  assert.deepEqual(template({ foo: 'bar' }, escape), '<div>BAR</div>')

  var { template } = await compile('<div text="{foo | uppercase}"></div>')
  assert.deepEqual(template({ foo: 'bar' }, escape), '<div>BAR</div>')

  var { template } = await compile('<div class="{foo | uppercase}"></div>')
  assert.deepEqual(template({ foo: 'bar' }, escape), '<div class="BAR"></div>')

  var { template } = await compile('<input checked="{query | trim}">')
  assert.deepEqual(template({ query: 'bar' }, escape), '<input checked>')

  var { template } = await compile('<input checked="{query | trim}">')
  assert.deepEqual(template({ query: '' }, escape), '<input>')

  var { template } = await compile('<input checked="{query | trim}">')
  assert.deepEqual(template({ query: '   ' }, escape), '<input>')

  var { template } = await compile('<input checked="{query | trim}">')
  assert.deepEqual(template({ query: 'bar' }, escape), '<input checked>')

  var { template } = await compile('{foo | whitespacestrip}')
  assert.deepEqual(template({ foo: 'b  ar' }, escape), 'bar')

  var { template } = await compile('{foo | uppercase}')
  assert.deepEqual(template({ foo: 'bar' }, escape), 'BAR')

  var { template } = await compile('{foo | upcase}')
  assert.deepEqual(template({ foo: 'bar' }, escape), 'BAR')

  var { template } = await compile('{foo | lowercase}')
  assert.deepEqual(template({ foo: 'BAR' }, escape), 'bar')

  var { template } = await compile('{foo | downcase}')
  assert.deepEqual(template({ foo: 'BAR' }, escape), 'bar')

  var { template } = await compile('{foo | dasherize}')
  assert.deepEqual(template({ foo: 'foo_bar' }, escape), 'foo-bar')

  var { template } = await compile('{foo | constantize}')
  assert.deepEqual(template({ foo: 'bar' }, escape), 'BAR')

  var { template } = await compile('{foo | underscore}')
  assert.deepEqual(template({ foo: 'foo-bar' }, escape), 'foo_bar')

  var { template } = await compile('{foo | capitalize}')
  assert.deepEqual(template({ foo: 'bar' }, escape), 'Bar')

  var { template } = await compile('{foo | unescape}')
  assert.deepEqual(template({ foo: '&amp;' }, escape), '&')

  var { template } = await compile('{foo | lowerfirst}')
  assert.deepEqual(template({ foo: 'FOO' }, escape), 'fOO')

  var { template } = await compile('{foo | uncapitalize}')
  assert.deepEqual(template({ foo: 'FOO' }, escape), 'fOO')

  var { template } = await compile('{foo | humanize}')
  assert.deepEqual(template({ foo: 'foo_bar' }, escape), 'Foo bar')

  var { template } = await compile('{foo | titleize}')
  assert.deepEqual(template({ foo: 'foo bar' }, escape), 'Foo Bar')

  var { template } = await compile('{foo | titlecase}')
  assert.deepEqual(template({ foo: 'foo bar' }, escape), 'Foo Bar')

  var { template } = await compile('{foo | classify}')
  assert.deepEqual(template({ foo: 'foobar' }, escape), 'Foobar')

  var { template } = await compile('{foo | pluralize}')
  assert.deepEqual(template({ foo: 'word' }, escape), 'words')

  var { template } = await compile('{foo | singularize}')
  assert.deepEqual(template({ foo: 'words' }, escape), 'word')

  var { template } = await compile('{foo | swapcase}')
  assert.deepEqual(template({ foo: 'BaR' }, escape), 'bAr')

  var { template } = await compile('{foo | camelize}')
  assert.deepEqual(template({ foo: 'bar_baz' }, escape), 'barBaz')

  var { template } = await compile('{foo | singlespace}')
  assert.deepEqual(template({ foo: 'bar   baz' }, escape), 'bar baz')

  var { template } = await compile('{foo | repeat(2)}')
  assert.deepEqual(template({ foo: 'fooBar' }, escape), 'fooBarfooBar')

  var { template } = await compile('{foo | summarize(3)}')
  assert.deepEqual(template({ foo: 'foo bar' }, escape), 'foo bar...')

  var { template } = await compile(`{foo | wrap('"')}`)
  assert.deepEqual(template({ foo: 'foo bar' }, escape), '"foo bar"')

  var { template } = await compile(`{foo | wrap('„', '”')}`)
  assert.deepEqual(template({ foo: 'foo bar' }, escape), '„foo bar”')

  var { template } = await compile(`{foo | unwrap('"')}`)
  assert.deepEqual(template({ foo: '"foo bar"' }, escape), 'foo bar')

  var { template } = await compile(`{foo | unwrap('„', '”')}`)
  assert.deepEqual(template({ foo: '„foo bar”' }, escape), 'foo bar')

  var { template } = await compile(`{foo | quote}`)
  assert.deepEqual(template({ foo: 'foo bar' }, escape), '"foo bar"')

  var { template } = await compile(`{foo | quote('pl')}`)
  assert.deepEqual(template({ foo: 'foo bar' }, escape), '„foo bar”')

  var { template } = await compile(`{foo | unquote}`)
  assert.deepEqual(template({ foo: '„foo bar”' }, escape), 'foo bar')

  var { template } = await compile(`{foo | unquote}`)
  assert.deepEqual(template({ foo: '"foo bar"' }, escape), 'foo bar')

  var { template } = await compile(`{foo | replace('bar', 'baz')}`)
  assert.deepEqual(template({ foo: 'foo baz' }, escape), 'foo baz')

  var { template } = await compile(`{foo | replace(${/\s/g},'')}`)
  assert.deepEqual(template({ foo: 'foo baz' }, escape), 'foobaz')

  var { template } = await compile(`{foo | strip}`)
  assert.deepEqual(template({ foo: 'foo baz' }, escape), 'foo baz')

  var { template } = await compile(`{foo | strip('baz')}`)
  assert.deepEqual(template({ foo: 'foo baz' }, escape), 'foo')

  var { template } = await compile(`{foo | strip('o')}`)
  assert.deepEqual(template({ foo: 'foo' }, escape), 'f')

  var { template } = await compile(`{foo | strip(['o', 'a'])}`)
  assert.deepEqual(template({ foo: 'foo bar' }, escape), 'f br')

  var { template } = await compile(`{foo | squeeze}`)
  assert.deepEqual(template({ foo: 'yellow moon' }, escape), 'yelow mon')

  var { template } = await compile(`{foo | squeeze('a-o')}`)
  assert.deepEqual(template({ foo: 'foo baar baazz  ban' }, escape), 'fo bar bazz ban')

  var { template } = await compile(`{foo | index('ello')}`)
  assert.deepEqual(template({ foo: 'hello world' }, escape), '1')

  var { template } = await compile(`{foo | chop}`)
  assert.deepEqual(template({ foo: 'foo barz' }, escape), 'foo bar')

  var { template } = await compile(`{foo | chomp('barz') | trim}`)
  assert.deepEqual(template({ foo: 'foo barz' }, escape), 'foo')

  var { template } = await compile(`{foo | dot}`)
  assert.deepEqual(template({ foo: 'foo bar ban' }, escape), 'foo bar ban.')

  var { template } = await compile(`{foo | crop(10)}`)
  assert.deepEqual(template({ foo: 'foo bar ban baz' }, escape), 'foo bar...')

  var { template } = await compile(`{foo | slugify('_')}`)
  assert.deepEqual(template({ foo: 'loremIpsum dolor $pec!al chars' }, escape), 'loremipsum_dolor_pecal_chars')

  var { template } = await compile(`{foo | hyphenate}`)
  assert.deepEqual(template({ foo: '%# lorem ipsum  ? $  dolor' }, escape), 'lorem-ipsum-dolor')

  var { template } = await compile(`{foo | initials}`)
  assert.deepEqual(template({ foo: 'Foo Bar' }, escape), 'FB')

  var { template } = await compile(`{foo | initials(".")}`)
  assert.deepEqual(template({ foo: 'Foo Bar' }, escape), 'F.B')

  var { template } = await compile(`{foo | tail}`)
  assert.deepEqual(template({ foo: 'Lorem ipsum dolor sit amet, consectetur' }, escape), '...dolor sit amet, consectetur')

  var { template } = await compile(`{foo | htmlstrip}`)
  assert.deepEqual(template({ foo: 'Hello <b><i>world!</i></b>' }, escape), 'Hello world!')

  var { template } = await compile(`{foo | abs}`)
  assert.deepEqual(template({ foo: -1 }, escape), '1')

  var { template } = await compile(`{foo | ceil}`)
  assert.deepEqual(template({ foo: 1.6 }, escape), '2')

  var { template } = await compile(`{foo | floor}`)
  assert.deepEqual(template({ foo: 1.6 }, escape), '1')

  var { template } = await compile(`{foo | round}`)
  assert.deepEqual(template({ foo: 1.4 }, escape), '1')

  var { template } = await compile(`{foo | round}`)
  assert.deepEqual(template({ foo: 1.6 }, escape), '2')

  var { template } = await compile(`{foo | factorial}`)
  assert.deepEqual(template({ foo: 3 }, escape), '6')
  var { template } = await compile(`{foo | square}`)
  assert.deepEqual(template({ foo: 4 }, escape), '16')

  var { template } = await compile(`{foo | trunc}`)
  assert.deepEqual(template({ foo: 13.33 }, escape), '13')

  var { template } = await compile(`{foo | pow(3)}`)
  assert.deepEqual(template({ foo: 2 }, escape), '8')

  var { template } = await compile(`{foo | truncate(6)}`)
  assert.deepEqual(template({ foo: 'foobarbaz' }, escape), 'foo...')

  var { template } = await compile(`{foo | abbreviate(6)}`)
  assert.deepEqual(template({ foo: 'foobarbaz' }, escape), 'foo...')

  var { template } = await compile(`{foo | pad("0")}`)
  assert.deepEqual(template({ foo: 'foo\nbar' }, escape), '0foo\n0bar')

  var { template } = await compile(`{foo | max}`)
  assert.deepEqual(template({ foo: [1, 2, 3] }, escape), '3')

  var { template } = await compile(`{foo | min}`)
  assert.deepEqual(template({ foo: [1, 2, 3] }, escape), '1')

  var { template } = await compile(`{foo | sqrt}`)
  assert.deepEqual(template({ foo: 4 }, escape), '2')

  var { template } = await compile(`{foo | add(10)}`)
  assert.deepEqual(template({ foo: 5 }, escape), '15')

  var { template } = await compile(`{foo | plus(10)}`)
  assert.deepEqual(template({ foo: 5 }, escape), '15')

  var { template } = await compile(`{foo | subtract(10)}`)
  assert.deepEqual(template({ foo: 5 }, escape), '-5')

  var { template } = await compile(`{foo | minus(10)}`)
  assert.deepEqual(template({ foo: 5 }, escape), '-5')

  var { template } = await compile(`{foo | multiply(10)}`)
  assert.deepEqual(template({ foo: 5 }, escape), '50')

  var { template } = await compile(`{foo | divide(10)}`)
  assert.deepEqual(template({ foo: 5 }, escape), '0.5')

  var { template } = await compile(`{foo | modulo(10)}`)
  assert.deepEqual(template({ foo: 5 }, escape), '5')

  var { template } = await compile(`{foo | increment}`)
  assert.deepEqual(template({ foo: 5 }, escape), '6')

  var { template } = await compile(`{foo | decrement}`)
  assert.deepEqual(template({ foo: 5 }, escape), '4')

  var { template } = await compile(`{foo | clamp(2, 8)}`)
  assert.deepEqual(template({ foo: 10 }, escape), '8')

  var { template } = await compile(`{foo | clamp(2, 8)}`)
  assert.deepEqual(template({ foo: 6 }, escape), '6')

  var { template } = await compile(`{foo | int}`)
  assert.deepEqual(template({ foo: 10 }, escape), '10')

  var { template } = await compile(`{foo | float}`)
  assert.deepEqual(template({ foo: 10.25 }, escape), '10.25')

  var { template } = await compile(`{foo | percentage}`)
  assert.deepEqual(template({ foo: 0.25 }, escape), '25%')

  var { template } = await compile(`{foo | fixed}`)
  assert.deepEqual(template({ foo: 10.5 }, escape), '11')

  var { template } = await compile(`{foo | fixed(2)}`)
  assert.deepEqual(template({ foo: 100.521 }, escape), '100.52')

  var { template } = await compile(`{foo | reverse}`)
  assert.deepEqual(template({ foo: 'bar' }, escape), 'rab')

  var { template } = await compile(`{foo | rotate}`)
  assert.deepEqual(template({ foo: 'bar' }, escape), 'bar')

  var { template } = await compile(`{foo | rotate(1)}`)
  assert.deepEqual(template({ foo: [1, 2, 3] }, escape), '2,3,1')

  var { template } = await compile(`{foo | reverse}`)
  assert.deepEqual(template({ foo: [1, 2, 3, 4] }, escape), '4,3,2,1')

  var { template } = await compile(`{foo | size}`)
  assert.deepEqual(template({ foo: [1, 2, 3, 4] }, escape), '4')

  var { template } = await compile(`{foo | size}`)
  assert.deepEqual(template({ foo: new Set([1, 2, 3]) }, escape), '3')

  var { template } = await compile(`{foo | count}`)
  assert.deepEqual(template({ foo: 'bar' }, escape), '3')

  var { template } = await compile(`{foo | count}`)
  assert.deepEqual(template({ foo: [1, 2] }, escape), '2')

  var { template } = await compile(`{foo | count}`)
  assert.deepEqual(template({ foo: new Set([1, 2, 3]) }, escape), '3')

  var { template } = await compile(`{foo | length}`)
  assert.deepEqual(template({ foo: 'bar' }, escape), '3')

  var { template } = await compile(`{foo | length}`)
  assert.deepEqual(template({ foo: [1, 2] }, escape), '2')

  var { template } = await compile(`{foo | length}`)
  assert.deepEqual(template({ foo: new Set([1, 2, 3]) }, escape), '3')

  var { template } = await compile(`{foo | drop(2)}`)
  assert.deepEqual(template({ foo: [1, 2, 3, 4] }, html => html), '3,4')

  var { template } = await compile(`{foo | take(2)}`)
  assert.deepEqual(template({ foo: [1, 2, 3, 4] }, escape), '1,2')

  var { template } = await compile(`{foo | slice(2, 4)}`)
  assert.deepEqual(template({ foo: [1, 2, 3, 4] }, escape), '3,4')

  var { template } = await compile(`{foo | json(2, 4)}`)
  assert.deepEqual(template({ foo: { bar: 'baz' } }, escape), '{\n  "bar": "baz"\n}')

  var { template } = await compile(`{foo | json(4)}`)
  assert.deepEqual(template({ foo: { bar: 'baz' } }, escape), '{\n    "bar": "baz"\n}')

  var { template } = await compile(`{foo | inspect}`)
  assert.deepEqual(template({ foo: { bar: 'baz' } }, escape), '{\n  "bar": "baz"\n}')

  var { template } = await compile(`{foo | inspect(4)}`)
  assert.deepEqual(template({ foo: { bar: 'baz' } }, escape), '{\n    "bar": "baz"\n}')

  var { template } = await compile(`{foo | prettify}`)
  assert.deepEqual(template({ foo: { bar: 'baz' } }, escape), '{\n  "bar": "baz"\n}')

  var { template } = await compile(`{foo | prettify(4)}`)
  assert.deepEqual(template({ foo: { bar: 'baz' } }, escape), '{\n    "bar": "baz"\n}')

  var { template } = await compile(`{foo | first}`)
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '1')

  var { template } = await compile(`{foo | second}`)
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '2')

  var { template } = await compile(`{foo | fourth}`)
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '4')

  var { template } = await compile(`{foo | fifth}`)
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '5')

  var { template } = await compile(`{foo | sixth}`)
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '6')

  var { template } = await compile(`{foo | seventh}`)
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '7')

  var { template } = await compile(`{foo | eigth}`)
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '8')

  var { template } = await compile(`{foo | ninth}`)
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '9')

  var { template } = await compile(`{foo | tenth}`)
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '10')

  var { template } = await compile(`{foo | last}`)
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, escape), '10')

  var { template } = await compile(`{foo | sum}`)
  assert.deepEqual(template({ foo: [1, 5, 18] }, escape), '24')

  var { template } = await compile(`{foo | last}`)
  assert.deepEqual(template({ foo: [1, 5, 18] }, escape), '18')

  var { template } = await compile(`{foo | mean}`)
  assert.deepEqual(template({ foo: [1, 5, 18] }, escape), '8')

  var { template } = await compile(`{foo | median}`)
  assert.deepEqual(template({ foo: [18, 5, 1] }, escape), '5')

  var { template } = await compile(`{foo | sample}`)
  assert.deepEqual(template({ foo: [1] }, escape), '1')

  var { template } = await compile(`{foo | nth(-5)}`)
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5] }, escape), '1')

  var { template } = await compile(`{foo | nth(3)}`)
  assert.deepEqual(template({ foo: [1, 2, 3, 4, 5] }, escape), '3')

  var { template } = await compile(`{foo | unique}`)
  assert.deepEqual(template({ foo: [1, 1, 2, 10, 2, 33] }, escape), '1,2,10,33')

  var { template } = await compile(`{foo | compact}`)
  assert.deepEqual(template({ foo: [0, 1, false, 2, '', 3] }, escape), '1,2,3')

  var { template } = await compile(`{foo | split(",")}`)
  assert.deepEqual(template({ foo: 'foo,bar' }, escape), 'foo,bar')

  var { template } = await compile(`{foo | split(",") | first}`)
  assert.deepEqual(template({ foo: 'foo,bar' }, escape), 'foo')

  var { template } = await compile(`{foo | split(",") | second}`)
  assert.deepEqual(template({ foo: 'foo,bar' }, escape), 'bar')

  var { template } = await compile(`{foo | dig("bar.baz")}`)
  assert.deepEqual(template({ foo: { bar: {} } }, escape), 'null')

  var { template } = await compile(`{foo | dig("bar.baz")}`)
  assert.deepEqual(template({ foo: { bar: { baz: 'qux' } } }, escape), 'qux')

  var { template } = await compile(`{foo | format }`)
  assert.deepEqual(template({ foo: new Date('2018/05/25') }, escape), '25-05-2018')

  var { template } = await compile(`{foo | format("DD.MM.YYYY") }`)
  assert.deepEqual(template({ foo: new Date('2018/05/25') }, escape), '25.05.2018')

  var { template } = await compile(`{foo | format("MM.YYYY") }`)
  assert.deepEqual(template({ foo: '2018/05/25' }, escape), '05.2018')

  var { template } = await compile(`{foo | day }`)
  assert.deepEqual(template({ foo: '2018/05/29' }, escape), '29')

  var { template } = await compile(`{foo | weekday }`)
  assert.deepEqual(template({ foo: new Date('2018-05-29') }, escape), '2')

  var { template } = await compile(`{foo | month }`)
  assert.deepEqual(template({ foo: new Date('2018-05-29') }, escape), '4')

  var { template } = await compile(`{foo | year }`)
  assert.deepEqual(template({ foo: new Date('2018-05-29') }, escape), '2018')

  var { template } = await compile(`{foo | prettydate }`)
  assert.deepEqual(template({ foo: new Date(2018, 5, 29) }, escape), 'Friday, 29th of June 2018')

  var { template } = await compile(`{foo | timestamp }`)
  assert.deepEqual(template({ foo: new Date(2018, 5, 29) }, escape), '2018-06-29')

  var { template } = await compile(`{foo | timestamp("YYYY/MM/DD") }`)
  assert.deepEqual(template({ foo: new Date(2018, 5, 29) }, escape), '2018/06/29')

  var { template } = await compile(`{foo | celsius }`)
  assert.deepEqual(template({ foo: '70°F' }, escape), '21°C')

  var { template } = await compile(`{foo | fahrenheit }`)
  assert.deepEqual(template({ foo: '21°C' }, escape), '70°F')

  var { template } = await compile(`{foo | fahrenheit }`)
  assert.deepEqual(template({ foo: '21°C' }, escape), '70°F')

  var { template } = await compile(`{foo | kelvin }`)
  assert.deepEqual(template({ foo: '70°F' }, escape), '294K')

  var { template } = await compile(`{new Date(2018, 5, 29) | prettydate}`)
  assert.deepEqual(template({}, escape), 'Friday, 29th of June 2018')

  var { template } = await compile(`{new Date(foo, bar, baz) | prettydate}`)
  assert.deepEqual(template({ foo: 2018, bar: 5, baz: 29 }, escape), 'Friday, 29th of June 2018')

  var { template } = await compile(`{photos | first | dig("src")}`)
  assert.deepEqual(template({
    photos:
    [
      { size: '100', src: 'baz' },
      { size: '200', src: 'qux' }
    ]
  }, escape), 'baz')

  var { template } = await compile(`{foo | first | dig("foo.bar.baz")}`)
  assert.deepEqual(template({
    foo:
    [
      { foo: { bar: { baz: 'qux' } } },
      { foo: { bar: { baz: 'quux' } } }
    ]
  }, escape), 'qux')

  var { template } = await compile(`{foo | values }`)
  assert.deepEqual(template({ foo: { bar: 1, baz: 2, ban: 'qux' } }, escape), '1,2,qux')

  var { template } = await compile(`{foo | values | first}`)
  assert.deepEqual(template({ foo: { bar: 1, baz: 2, ban: 'qux' } }, escape), '1')

  var { template } = await compile(`{foo | keys}`)
  assert.deepEqual(template({ foo: { bar: 1, baz: 2, ban: 'qux' } }, escape), 'bar,baz,ban')

  var { template } = await compile(`{foo | keys}`)
  assert.deepEqual(template({ foo: { bar: 1, baz: 2, ban: 'qux' } }, escape), 'bar,baz,ban')

  var { template } = await compile(`{foo | keys | last}`)
  assert.deepEqual(template({ foo: { bar: 1, baz: 2, ban: 'qux' } }, escape), 'ban')

  var { template } = await compile(`<img class="img-responsive" src="/assets/images/{photos | first}" alt="Photo">`)
  assert.deepEqual(template({ photos: ['foo.jpg', 'bar.jpg'] }, escape), '<img class="img-responsive" src="/assets/images/foo.jpg" alt="Photo">')

  var { template } = await compile(`<img class="img-responsive" src="/assets/images/{photos | first}" alt="Photo">`)
  assert.deepEqual(template({ photos: ['foo.jpg', 'bar.jpg'] }, escape), '<img class="img-responsive" src="/assets/images/foo.jpg" alt="Photo">')

  var { template } = await compile('{ foo | ltrim }')
  assert.deepEqual(template({ foo: '   qwe' }, escape), 'qwe')
  assert.deepEqual(template({ foo: '   qwe  ' }, escape), 'qwe  ')

  var { template } = await compile('{ foo | ltrim("_-") }')
  assert.deepEqual(template({ foo: '-_-qwe-_-' }, escape), 'qwe-_-')

  var { template } = await compile('{ foo | rtrim }')
  assert.deepEqual(template({ foo: 'qwe   ' }, escape), 'qwe')
  assert.deepEqual(template({ foo: '   qwe  ' }, escape), '   qwe')

  var { template } = await compile('{ foo | rtrim("_-") }')
  assert.deepEqual(template({ foo: '-_-qwe-_-' }, escape), '-_-qwe')

  var { template } = await compile(`{foo | prepend('Hi ') }`)
  assert.deepEqual(template({ foo: 'John' }, escape), 'Hi John')

  var { template } = await compile(`{foo | prepend(4, 5, 6) | first }`)
  assert.deepEqual(template({ foo: [1, 2, 3] }, escape), '4')

  var { template } = await compile(`{foo | prepend(4, 5, 6) | last }`)
  assert.deepEqual(template({ foo: [1, 2, 3] }, escape), '3')

  var { template } = await compile(`{foo | append(4, 5, 6) | first}`)
  assert.deepEqual(template({ foo: [1, 2, 3] }, escape), '1')

  var { template } = await compile(`{foo | append(4, 5, 6) | last}`)
  assert.deepEqual(template({ foo: [1, 2, 3] }, escape), '6')

  var { template } = await compile('{foo | flatten | size}')
  assert.deepEqual(template({ foo: [1, [2, [3, [4]], 5]] }, escape), '5')

  var { template } = await compile('{foo | pluck("name") | first}')
  assert.deepEqual(template({ foo: [{ name: 'baz' }, { name: 'ban' }] }, escape), 'baz')

  var { template } = await compile('{foo | merge({ b: 2 }) | keys}')
  assert.deepEqual(template({ foo: { a: 1 } }, escape), 'a,b')

  var { template } = await compile('{foo | merge(bar) | keys}')
  assert.deepEqual(template({ foo: { a: 1 }, bar: { b: 2 } }, escape), 'a,b')

  // TODO handle nested variables
  // var { template } = await compile('{foo | merge(bar.baz) | keys}')
  // assert.deepEqual(template({ foo: { a: 1 }, bar: { baz: { c: 3 } } }, escape), 'a,c')

  var { template } = await compile('{foo | clone | keys}')
  assert.deepEqual(template({ foo: { a: 1 } }, escape), 'a')
})

test('filters: usage in partials', async assert => {
  var { template } = await compile(`<template foo>{category | uppercase}</template><foo category="js"/>`)
  assert.deepEqual(template({}, escape), 'JS')

  var { template } = await compile(`<template foo>{category | uppercase | lowerfirst}</template><foo category="js"/>`)
  assert.deepEqual(template({}, escape), 'jS')

  var { template } = await compile(`
    <template foo>
      {category | uppercase | lowerfirst}
    </template>
    <template bar>
      <div class="{container || 'container'}">
        <slot></slot>
      </div>
    </foo>
    </template>
    <bar container="fluid-container" category="css">
      <foo category="{category}"/>
    </bar>
  `)
  assert.deepEqual(template({category: 'css'}, escape), '<div class="fluid-container">cSS</div>')
})

test('filters: custom filters', async assert => {
  var { template } = await compile('{foo | myFilter}', {
    filters: {
      myFilter: function myFilter (text) {
        return text.toUpperCase()
      }
    }
  })
  assert.deepEqual(template({ foo: 'bar' }, escape), 'BAR')

  var { template } = await compile('{foo | myFilter}', {
    filters: {
      myFilter: function (text) {
        return text.toUpperCase()
      }
    }
  })
  assert.deepEqual(template({ foo: 'bar' }, escape), 'BAR')
})

test('filters: monetize', async assert => {
  var { template } = await compile(`{foo | monetize(2)}`)
  assert.deepEqual(template({ foo: 25 }, escape), '25,00 zł')

  var { template } = await compile(`{foo | monetize({ symbol: "$", ending: false, space: false , separator: "."})}`)
  assert.deepEqual(template({ foo: 100 }, escape), '$100.00')

  var { template } = await compile(`
    <import price from="components/price.html"/>
    <price {product}/>
  `, {
    paths: [
      join(__dirname, '../../fixtures')
    ],
    languages: ['pl', 'de', 'en']
  })

  const product = {
    prices: {
      PLN: 0.99,
      EUR: 0.99,
      GBP: 0.99
    }
  }
  assert.deepEqual(template({ language: 'pl', product }), '0,99 zł')
  assert.deepEqual(template({ language: 'de', product }), '€0.99')
  assert.deepEqual(template({ language: 'en', product }), '£0.99')
})
