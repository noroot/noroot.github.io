```
  __       _          _                     _
 / _| __ _| |___  ___| |_ _ __ _   _  ___  (_) ___
| |_ / _` | / __|/ _ \ __| '__| | | |/ _ \ | |/ _ \
|  _| (_| | \__ \  __/ |_| |  | |_| |  __/_| | (_) |
|_|  \__,_|_|___/\___|\__|_|   \__,_|\___(_)_|\___/

== [Gemini capsule] * ============ [ 2023-08-26 ] ==
```
=> / ← Back
# Benchmarks code for CPU testing

Various benchmarks to launch to load CPU

=> https://benchmarksgame-team.pages.debian.net/benchmarksgame/ https://benchmarksgame-team.pages.debian.net/benchmarksgame/

Ruby Example:

```

# The Computer Language Benchmarks Game

# https://salsa.debian.org/benchmarksgame-team/benchmarksgame/

# Contributed by Wesley Moxam

# Modified by Sokolov Yura aka funny_falcon

# Parallelised by Scott Leggett

# Thread.exclusive deprecated

require 'thread'

module MiniParallel

    class Worker

        def initialize(read, write)

            @read, @write = read, write

        end

        def close_pipes

            @read.close

            @write.close

        end

        def work(index)

            Marshal.dump(index, @write)

            Marshal.load(@read)

        end

    end

    def self.map(array, &block)

        workinprocesses(

            array,

            [array.size, core_count].min,

            &block

        )

    end

    def self.core_count

        @@core_count ||= IO.read("/proc/cpuinfo").scan(/^processor/).size

    end

    private

    def self.workinprocesses(array, count, &block)

        index = -1

        results, threads = [], []

        mx = Mutex.new

        workers = create_workers(array, count, &block)

        workers.each do |worker|

            threads << Thread.new do

                loop do

                    mx.synchronize do index += 1 end

                    break if index >= array.size

                    results[index] = worker.work(index)

                end

                worker.close_pipes

            end

        end

        threads.each(&:join)

        Process.waitall

        results

    end

    def self.create_workers(array, count, &block)

        workers = []

        count.times do

            workers << create_worker(array, workers, &block)

        end

        workers

    end

    def self.createworker(array, startedworkers, &block)

        childread, parentwrite = IO.pipe

        parentread, childwrite = IO.pipe

        Process.fork do

            startedworkers.each(&:closepipes)

            parent_write.close

            parent_read.close

            processincomingjobs(childread, childwrite, array, &block)

            child_read.close

            child_write.close

        end

        child_read.close

        child_write.close

        Worker.new(parentread, parentwrite)

    end

    def self.processincomingjobs(read, write, array, &block)

        until read.eof?

            index = Marshal.load(read)

            Marshal.dump(block.call(array[index]), write)

        end

    end

end

class Fannkuch

    def initialize(n, start, max_perms)

        @n = n

        @p = (0..n).to_a

        @s = @p.dup

        @q = @p.dup

        @sign = 1

        @sum = @maxflips = 0

        @maxperms = maxperms

        @perm_count = -start

        start.times{permute}

    end

    def flip

        loop do

            if @permcount == @maxperms

                return [@sum, @maxflips]

            end

            if (q1 = @p[1]) != 1

                @q[0..-1] = @p

                flips = 1

                until (qq = @q[q1]) == 1

                    @q[q1] = q1

                    if q1 >= 4

                        i, j = 2, q1 - 1

                        while i < j

                            @q[i], @q[j] = @q[j], @q[i]

                            i += 1

                            j -= 1

                        end

                    end

                    q1 = qq

                    flips += 1

                end

                @sum += @sign * flips

                @maxflips = flips if flips > @maxflips # New maximum?

            end

            permute

        end

    end

    def permute

        @perm_count += 1

        if @sign == 1

            # Rotate 1<-2.

            @p[1], @p[2] = @p[2], @p[1]

            @sign = -1

        else

            # Rotate 1<-2 and 1<-2<-3.

            @p[2], @p[3] = @p[3], @p[2]

            @sign = 1

            i = 3

            while i <= @n && @s[i] == 1

                @s[i] = i

                # Rotate 1<-...<-i+1.

                t = @p.delete_at(1)

                i += 1

                @p.insert(i, t)

            end

            @s[i] -= 1  if i <= @n

        end

    end

end

abort "Usage: #{FILE} n\n(n > 6)" if (n = ARGV[0].to_i) < 6

corecount = MiniParallel.corecount

chunksize = (1..n).reduce(:*) / corecount

sum, flips =

    if core_count > 1

        # adjust job sizes to even out workload

        weights = if core_count > 1

                      weights = []

                      (core_count/2).times do |i|

                          weights << i * 0.1 + 0.05

                      end

                      weights = weights.reverse + weights.map{|i|-i}

                  else

                      [0]

                  end

        # Generate start position for each chunk

        chunks = core_count.times.zip(weights).map do |count, weight|

            [count * chunk_size +

             (count > 0 ? (weights[0,count].reduce(:+) * chunk_size).round : 0),

             chunksize + (weight * chunksize).round]

        end

        chunk_results =

            if (RUBY_PLATFORM == 'java')

                chunk_collector = []

                threads = []

                chunks.each.withindex do |(start,weightedsize),i|

                    threads << Thread.new do

                        chunkcollector[i] = Fannkuch.new(n,start,weightedsize).flip

                    end

                end

                threads.all?(&:join)

                chunk_collector

            else

                MiniParallel.map(chunks) do |start, weighted_size|

                    Fannkuch.new(n,start,weighted_size).flip

                end

            end

        chunk_results.reduce do |memo, (cksum, fmax)|

            [memo[0] + cksum, [memo[1], fmax].max]

        end

    else

        Fannkuch.new(n,0,chunk_size).flip

    end

printf "%d\nPfannkuchen(%d) = %d\n", sum, n, flips

```

```
     ░▒▓▓▒░  FalseTrue - dmth's notes | Gemini Capsule [-]  ░▒▓▓▒░
```
