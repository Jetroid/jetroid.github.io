---
title: A Guide to PIC Microcontroller Paging
date: 2020-06-12 21:07:23 +0100
micro: true
categories:
 - "Micro"
---
When your program grows long enough on a simple PIC microcontroller, you will eventually reach a point where your code no longer fits on a single page.

I'm writing this to explain the problem and hopefully help you avoid some of the pitfalls that I experienced when I ran up against this problem for the first time recently.

# An Introduction to Paging

##### What is a page?

So what is a page? Well, an instruction like a `goto` or a `call` can only hold so many bits of address in it. We use page to refer to all of the instruction addresses that a single `goto` or `call` can reach without additional helper commands.

For example, 14 bit devices like the PIC16F88 or PIC16F1765's `goto` and `call` contain just 11 bits worth of address in their opcode, meaning that the page size is 2^11 (2048) instructions. The 16F88 and 16F1765 have 4096 (2^12) and 8192 (2^13) total addresses, meaning that they have 2 and 4 pages, respectively. 12 bit devices like the PIC10F series have only 9 bits worth of address in their `goto`/`call` opcodes (512 addresses), but can have up to 1024 instructions.

The specifics of the numbers that I am quoting here may change from device to device, but the general principles of this article should apply. Notably, PIC18 devices and above do not use paging, so this article can be ignored for those devices.

##### What's wrong with paging?

Paging is a problem because when we try to jump to a label that is not on the same code page as us, we instead jump to the equivalent location in our own page, which is decidedly *not* where we wanted to be.

You can visualise the problem using the table below. Just imagine that the table had 2048 rows. Just lookup the address that you're trying to jump to, then follow it along and look at the column of the page you're currently in. This table is correct for 14 bit devices.

Page 0 | Page 1 | Page 2 | Page 3
0x0000 | 0x0800 | 0x1000 | 0x1800
0x0001 | 0x0801 | 0x1001 | 0x1801
0x0002 | 0x0802 | 0x1002 | 0x1802
...    | ...    | ...    | ...
0x07FD | 0x0FFD | 0x17FD | 0x1FFD
0x07FE | 0x0FFE | 0x17FE | 0x1FFE
0x07FF | 0x0FFF | 0x17FF | 0x1FFF

For example, if we're on a 14 bit device and in page 0 (ie we are currently on an instruction between 0x0000 to 0x07FF), then if we try to `goto` a label at address 0x0FFD (page 1), we will instead jump to whatever instruction is at 0x7FD instead.

Landing at (and subsequently executing) an instruction of code that you didn't intend to can be catastrophic for obvious reasons.

##### Page selection

So how do we use those instructions that aren't on the same page as us? How do we make sure that we jump to the instruction that we intended to?

Before we explain that, let's examine what a jump instruction like `goto` and `call` is really doing.

Really, `goto` and `call` are just quick and convenient ways of setting the program counter (if we ignore the `return` part of `call` for a moment). In a PIC, the program counter is split across two bytes; the least significant bits go in `PCL`, whilst the most significant bits go to `PCLATH`. The `goto` and `call` instructions write a full byte to `PCL` and then a few bits to `PCLATH`. The problem is that they do not write all of the bits of the label. the most significant bits.

As an example, I'll rewrite a `goto` instruction in an equivalent using just `movlw` and `movwf`. I'm not suggesting that we should ever consider using the second block of code, though!

```
    goto    label

    org 0x0800      ;label is on page 1
label:
    ; some code here
```

This code could be rewritten as:

```
    movlw   HIGH label  ;this is equivalent to movlw 0x08
    movwf   PCLATH
    movlw   LOW label   ;this is equivalent to movlw 0x00
    movwf   PCL

    org 0x0800      ;label is on page 1
label:
    ; some code here
```

Technically, the second block of code is not 100% equivalent. Why? Well, it uses more instructions (so more memory and also takes longer to execute) but it also sets ALL bits of the Program Counter, not just the ones that a `goto` or `call` can.

We *could* use the second block of code to goto to a correct page, but it would be annoying to use in practice because it would mangle the W register.

There's an easier way to set the upper bits of PCLATH: `pagesel`.

##### Pagesel

`pagesel` is an assembler directive that automatically generates commands to adjust the upper bits of PCLATH that `goto` and `call` do not set.

We simply call `pagesel <label>` before executing a call or goto.

```
    pagesel label
    goto    label

    org 0x0800      ;label is on page 1
label:
    ;some code here
```

If `label` was on the second page of a 14 bit microcontroller (ie one where `goto` has only 11 bits), then the `pagesel` might be translated to this:

```
    bcf     PCLATH,4
    bsf     PCLATH,3
    goto    label

    org 0x0800      ;label is on page 1
label:
    ;some code here
```

Obviously, we could write that code ourselves, but it's usually clearer (and more portable when you want to transfer your code to a new device!) to just use `pagesel`

##### When to use pagesel

The reason we have paging is because `goto` and `call` do not contain the full address of the label that they are trying to return to. So what about `return`, `retfie`, or `retlw`? Do these commands contain the full address?

In short, yes. Pagesel is not needed before these commands because the full address is stored on the stack at the time of the `call` or interrupt occurring. We will always return to the correct page and instruction.

However, the `return`/`retfie`/`retlw` do NOT correct the PCLATH to point to the page that we are returning to. This can be useful but it can also be a hindrance.

In the following example, we want to make many calls to routines that are on page 1. Not having the `return` change PCLATH is useful here because we don't have to repeat `pagesel` before each `call`.

```
    pagesel label1
    call    label1

                    ;Because PCLATH isn't altered by the return,
                    ;we don't need a pagesel here
    call    label2

                    ;Because PCLATH isn't altered by the return,
                    ;we don't need a pagesel here
    call    label3

    org 0x0800      ;label1, label2, and label3 are all on page 1
label1:
    ;some code here
    return

label2:
    ;some code here
    return

label3:
    ;some code here
    return
```

In the next example, we make just one call to a routine on page 1 before wanting to goto a routine on page 0. Because `PCLATH` was not changed by `return`, the `goto foo` will fail and instead go to some location in page 1.

```
    pagesel label
    call    label

                    ;DANGER! PCLATH is not changed by the return, so
                    ;a pagesel is needed here to stop the `goto` from
                    ;putting us somewhere in page 1
    goto    foo

foo:
    ;some code here

    org 0x0800      ;label is on page 1
label:
    ;some code here
    return
```

If we want to be safe, we can always include a `pagesel $` instruction after a call. `pagesel $` is just a short way of saying "Select the page that we are currently executing".

The previous examples have been written to use this technique.

```
    pagesel label1
    call    label1
    pagesel $		;This works, but is unnecessary

    pagesel label2
    call    label2
    pagesel $		;This works, but is unnecessary

    pagesel label3
    call    label3
    pagesel $

    org 0x0800      ;label1, label2, and label3 are all on page 1
label1:
    ;some code here
    return

label2:
    ;some code here
    return

label3:
    ;some code here
    return
```

```
    pagesel label
    call    label
    pagesel $		;Our `goto foo` now goes to the correct place!

    goto    foo

foo:
    ;some code here

    org 0x0800      ;label is on page 1
label:
    ;some code here
    return
```

As with many things in assembly, it often comes down to understanding the rules. If you're unclear, there is a safe but suboptimal way, but if you know what you are doing, you can be much more efficient.

# Paging and Interrupts

The previous sections have covered everything that you need to know for a PIC micro-controller project that does not use interrupts.

When using interrupts, a few new problems pop up, as will be discussed shortly.

##### Context Saving

As you are probably aware, when entering an interrupt service routine, your program jumps out of the normal program flow and jumps to a special interrupt service routine. This jump can occur at any point between any two different lines of code in your application. Unfortunately, the instructions in your interrupt service routine can inadvertently disrupt your non-isr code by changing the values of common registers.

Of note here is that one of the registers that we could inadvertently change is the PCLATH register - the upper byte of your program counter. The interrupt doesn't change this when jumping to the interrupt vector, but you could unwittingly change it in your code. If you did that, then returning from the interrupt and executing a `call` or `goto` would cause your code to jump to the incorrect page, even if `pagesel` had previously been used correctly!

Thankfully, if you're using a newer device, Microchip has thought of this and implemented a hardware 'context saving' feature, so you don't have to worry. Search for 'Automatic Context Saving' in your datasheet to check if you have it.

On older devices, you have to implement this yourself. I use the following block of code for my interrupt service routines. I don't remember writing this myself so I've inevitably stolen it from somewhere, but I consider it to be a pretty standard boilerplate piece of code, so I don't mind sharing it.

```
InterruptEnter:
    movwf   W_TEMP          ;save W register
    swapf   STATUS, w       ;swap status to be saved into W (movf alters status)
    movwf   STATUS_TEMP     ;save STATUS register
    movfw   PCLATH
    movwf   PCLATH_TEMP     ;save PCLATH register

    ;Your Interrupt Routine Code Goes Here

    movfw   PCLATH_TEMP     ;restore PCLATH register (correct code page)
    movwf   PCLATH
    swapf   STATUS_TEMP, w  ;restore STATUS register
    movwf   STATUS
    swapf   W_TEMP, f       ;restore W register
    swapf   W_TEMP, w
    retfie
```

Note that we use swapf because movf alters STATUS bits.

Naturally, if you are sure that you aren't altering W, STATUS, or PCLATH in your ISR, you don't need to do some/all of the above.

##### Jumping during ISR

The next problem comes once we've already saved the context.

The interrupt does not change the PCLATH. That means that if you jumped into the ISR from a different page, any calls or goto's would point to the wrong pages!

I suggest including a `pagesel $` just before the `;Your Interrupt Routine Code Goes Here` line in the code snippet above.

Automatic Context Saving does NOT solve this problem, so on a newer device with context saving, your interrupt might look like this:

```
InterruptEnter:
    pagesel $

    ;Your Interrupt Routine Code Goes Here

    retfie
```

##### GOTO ISR

The main reason I wanted to write this article was to highlight the following issue. Took me a while to get here, I know!

You'll often see something like this at the top of assembly programs online:

```
    org 0x0000              ;Reset Vector
    goto    main
    org 0x0004              ;Interrupt Vector
    goto    isr
    org 0x2100              ;EEPROM Presets
    de  0x00, 0x01, ...
```

This is a simple set of vectors telling your application where to go. It's standard stuff.

Indeed, something similar is used on pages 99/100 of the [ASSEMBLER/LINKER/LIBRARIAN USER’S GUIDE](http://ww1.microchip.com/downloads/en/DeviceDoc/33014K.pdf).

The specific vectors used aren't important; many won't have EEPROM, some will have a different vector, whatever.

What IS important here is that `goto isr` line. If you've been paying attention so far, that should be shouting and screaming to you!

We know that:

* An interrupt can be triggered from any line of code of any page
* The ISR does not change PCLATH
* `goto` can not guarantee that we go to the correct page

What happens if our ISR is triggered whilst we are on a different page to the `isr` label?

It doesn't go to the ISR, that's what!

I had a real problem with this over the last few days. It's such an innocuous line of code that you don't even think about, but it can cause mayhem for you!

Instead, I suggest moving your whole ISR code to be directly below the `org 0x0004` instruction. You can re-order the other vectors, it doesn't matter. In every chip I have examined, program memory begins at 0x0005, so I don't think that there are any problems doing this. I'd check the 'PROGRAM MEMORY MAP' in your datasheet to be sure, though.

Example follows:

```
    org 0x0000              ;Reset Vector
    goto    main
    org 0x2100              ;EEPROM Presets
    de  0x00, 0x01, ...
    org 0x0004              ;Interrupt Vector
    movwf   W_TEMP          ;save W register
    swapf   STATUS, w       ;swap status to be saved into W (movf alters status)
    movwf   STATUS_TEMP     ;save STATUS register
    movfw   PCLATH
    movwf   PCLATH_TEMP     ;save PCLATH register

    pagesel $
    ;Your Interrupt Routine Code Goes Here

    ;... you get the idea
```