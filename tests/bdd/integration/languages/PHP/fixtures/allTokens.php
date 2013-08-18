<%= 1 %>

<?php
    namespace Uniter\Toolset;

    use Things\Set;

?>

<p>Some intro text</p><?php

declare(ticks=1):
enddeclare;

declare(ticks=4);

include('this');
include_once('that');
require('this');
require_once('that');

trait Useful
{
    public function doSomething()
    {
        return 1;
    }

    public function getTraitName()
    {
        return __TRAIT__;
    }
}

trait Useless
{
    public function doSomething()
    {
        return 0;
    }
}

interface Utility
{
    public function doSomething();
}

abstract class Toolset extends Set implements Utility
{
    const USAGE = <<<EOS
Usage: None, really.
But it might be helpful to add some later.
EOS;
    const USEFULNESS = 0.5;

    private $data = array('key' => 'value');
    private $doubleQuotedConstant = "hello";
    var $darkAges = 'probably';

    use Useful, Useless {
        Useful::doSomething insteadof Useless;
    }

    protected static function also($something, $somethingElse)
    {
        return $something && $somethingElse;
    }

    public function addTo(&$number, $operand)
    {
        $number += $operand;
    }

    public function appendTo(&$string, $suffix)
    {
        $string .= $suffix;
    }

    public function bitwise($v1, $v2, $v3, $v4)
    {
        return ($v1 & $v2) | ($v3 ^ $v4);
    }

    public function bitwiseAndWith(&$number, $mask)
    {
        $number &= $mask;
    }

    public function bitwiseOrWith(&$number, $flags)
    {
        $number |= $flags;
    }

    public function copy()
    {
        return clone $this;
    }

    public function decrement(&$number)
    {
        $number--;
    }

    public function display($string, $printOrEcho = 'echo')
    {
        // Use normal equal for fun
        if ($printOrEcho == 'echo') {
            echo $string;
        } else {
            print $string;
        }
    }

    public function divideBy(&$number, $what)
    {
        $number /= $what;
    }

    /**
     * This is a bad idea
     */
    public function doWhile(callable $callback)
    {
        do {
        } while ($callback());
    }

    public function either1($condition, callable $then, callable $else)
    {
        if ($condition) {
            $then();
        } else {
            $else();
        }
    }

    public function either2($condition, callable $then, callable $else)
    {
        if ($condition):
            $then();
        else:
            $else();
        endif;
    }

    public function evaluate($code)
    {
        return eval($code);
    }

    public function exit1()
    {
        exit('bye');
    }

    public function exit2()
    {
        die('argh');
    }

    public function for1(callable $init, callable $condition, callable $iterate, callable $iterator)
    {
        for ($init(); $condition(); $iterate()) {
            $iterator();
        }
    }

    public function for2(callable $init, callable $condition, callable $iterate)
    {
        for ($init(); $condition(); $iterate()):
            $iterator();
        endfor;
    }

    public function foreach1($object, callable $iterator)
    {
        foreach ($object as $key => $value) {
            $iterator($value, $key);
        }
    }

    public function foreach2($object, callable $iterator)
    {
        foreach ($object as $key => $value):
            $iterator($value, $key);
        endforeach;
    }

    public function getBoth(&$value1, &$value2, $from)
    {
        list($value1, $value2) = $from;
    }

    public function getFooter(array $data)
    {
        return "$data[type] $data[0] of {$data[1]}. ${data[2]}.";
    }

    public function getDirectory()
    {
        return __DIR__;
    }

    public function getFile()
    {
        return __FILE__;
    }

    public function getGlobal()
    {
        global $thing;
        return $thing;
    }

    public function getLine()
    {
        return __LINE__;
    }

    public function getName()
    {
        return __FUNCTION__ . '(' . __METHOD__ . ')';
    }

    public function getNamespace()
    {
        return __NAMESPACE__;
    }

    public function getSalutation($name)
    {
        $salutation = 'Dear';
        $punctuation = ',';

        return "${salutation} $name{$punctuation}\n";
    }

    public function getUsefulness()
    {
        return self::USEFULNESS;
    }

    public function goBack()
    {
        $retries = 1;
        retry: {
            sleep(1);
            if ($retries--) {
                goto retry;
            }
        }
    }

    public function increment(&$value)
    {
        $value++;
    }

    public function isA($object, $class)
    {
        return $object instanceof $class;
    }

    public function isEmpty($value)
    {
        return empty($value);
    }

    public function isLTE($value, $than)
    {
        return $value <= $than;
    }

    public function isNotIdentical($value, $to)
    {
        return $value !== $to;
    }

    public function isNotLooselyEqual($value, $to)
    {
        return $value != $to;
    }

    public function isGTE($value, $than)
    {
        return $value >= $than;
    }

    public function isItSet($value)
    {
        return isset($value);
    }

    public function oneOrTheOther($one, $other)
    {
        return $one || $other;
    }

    final public function iterate(callable $callback)
    {
        foreach ($this->data as $key => $value) {
            if ($key === 'HALT!') {
                break 1;
            } elseif ($key === 'SKIP') {
                continue;
            }

            $callback($key, $value);
        }
    }

    public function logically($value1, $value2, $value3)
    {
        return $value1 and $value2 or $value3 xor $value1;
    }

    abstract public function magic();

    public function modWith(&$value, $what)
    {
        $value %= $what;
    }

    public function mulWith(&$value, $what)
    {
        $value *= $what;
    }

    public function printHTML1($html)
    {
        ?><div><?=$html ?></div><?php
    }

    public function printHTML2($html)
    {
        ?><div><%=$html %></div><?php
    }

    public function range()
    {
        yield 1;
        yield 2;
    }

    public function remove(array $array, $value)
    {
        unset($array[$value]);
    }

    public function select1($which)
    {
        $result = null;

        switch ($which) {
            case 1:
                $result = '1';
                break;
            default:
                $result = false;
        }

        return $result;
    }

    public function select2($which)
    {
        $result = null;

        switch ($which):
        case 1:
            $result = '1';
            break;
        default:
            $result = false;
        endswitch;

        return $result;
    }

    public function shiftLots(&$value)
    {
        $value <<= $value << 2 >> 9;
        $value >>= 3;
    }

    public function subtractFrom(&$number, $what)
    {
        $number -= $what;
    }

    public function throwButIgnore()
    {
        try {
            throw new Exception('Arrghh in ' . __CLASS__);
        } catch (Exception $ex) {
            $error = $ex;
        } finally {
            return $error;
        }
    }

    public function toArray($value)
    {
        return (array)$value;
    }

    public function toBool($value)
    {
        // Yep, nonsense
        return (bool)$value . (boolean)$value;
    }

    public function toDouble($value)
    {
        return (double)$value;
    }

    public function toInt($value)
    {
        // Yep, nonsense
        return (int)$value . (integer)$value;
    }

    public function toObject($value)
    {
        return (object)$value;
    }

    public function toString($value)
    {
        return (string)$value;
    }

    public function toUnset($value)
    {
        return (unset)$value;
    }

    public function while1(callable $condition, callable $iterator)
    {
        while ($condition()) {
            $iterator();
        }
    }

    public function while2(callable $condition, callable $iterator)
    {
        while ($condition()):
            $iterator();
        endwhile;
    }

    public function bitwiseXorWith(&$number, $flags)
    {
        $number ^= $flags;
    }
}

?><p>Some outro text</p>

<?php
    __halt_compiler(); Some installation data
