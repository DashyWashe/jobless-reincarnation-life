import asyncio, sys, random
from playwright.async_api import async_playwright
URL = 'file:///home/claude/jr/dist/jobless-reincarnation.html'
SH = '/home/claude/jr/shots/'
async def main(scheme, w, h):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, color_scheme=scheme)
        page = await ctx.new_page()
        errs = []
        page.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)))
        page.on('console', lambda m: errs.append('CONSOLE ' + m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
        await page.goto(URL); await page.wait_for_timeout(1500)
        tag = f'desk_{scheme}_{w}'
        await page.screenshot(path=SH + f'{tag}_1_title.png')
        await page.click('[data-a=newlife]'); await page.wait_for_timeout(300)
        await page.screenshot(path=SH + f'{tag}_2_create.png')
        await page.click('.hero-go [data-a=begin]'); await page.wait_for_timeout(300)
        async def events():
            for _ in range(8):
                if await page.locator('.sh-event').count():
                    ch = page.locator('.sh-event .choice:not([disabled])')
                    n = await ch.count()
                    if not n: break
                    await page.keyboard.press(str(1 + random.randrange(min(n, 4))))
                    await page.wait_for_timeout(60)
                    if await page.locator('[data-a=evcontinue]').count(): await page.keyboard.press('Enter'); await page.wait_for_timeout(50)
                else: break
        shot_ev = False
        for yr in range(30):
            if await page.locator('.death').count(): break
            if await page.locator('.sh-event').count() and not shot_ev and yr > 4:
                await page.wait_for_timeout(900); await page.screenshot(path=SH + f'{tag}_5_event.png'); shot_ev = True
            await events()
            await page.keyboard.press('2'); await page.wait_for_timeout(40)
            for _ in range(4):
                btns = page.locator('#tabbody button.btn[data-a=mana]:not([disabled]), #tabbody button.btn[data-a=magic]:not([disabled]), #tabbody button.btn[data-a=sword]:not([disabled]), #tabbody button.btn[data-a=aura]:not([disabled]), #tabbody button.btn[data-a=trial]:not([disabled])')
                n = await btns.count()
                if not n: break
                await btns.nth(random.randrange(n)).click(); await page.wait_for_timeout(30)
                await events()
            if yr == 7: await page.screenshot(path=SH + f'{tag}_3_train.png')
            await page.keyboard.press('3'); await page.wait_for_timeout(30)
            mf = page.locator('[data-a=meet]:not([disabled])')
            if await mf.count(): await mf.first.click(); await page.wait_for_timeout(30)
            await events()
            if yr == 12: await page.screenshot(path=SH + f'{tag}_4_people.png')
            await page.keyboard.press('Space'); await page.wait_for_timeout(100)
        await events()
        if not await page.locator('.death').count():
            await page.keyboard.press('1'); await page.wait_for_timeout(100)
            await page.screenshot(path=SH + f'{tag}_6_overview.png')
            await page.keyboard.press('4'); await page.wait_for_timeout(100)
            await page.screenshot(path=SH + f'{tag}_7_work.png')
            await page.keyboard.press('5'); await page.wait_for_timeout(100)
            await page.screenshot(path=SH + f'{tag}_8_world.png')
            await page.keyboard.press('m'); await page.wait_for_timeout(250)
            await page.screenshot(path=SH + f'{tag}_9_menu.png')
            await page.click('.mrow[data-c=endlife]'); await page.wait_for_timeout(150)
            await page.click('[data-a=yes]'); await page.wait_for_timeout(1500)
        await page.screenshot(path=SH + f'{tag}_10_death.png')
        ow = await page.evaluate('document.documentElement.scrollWidth > window.innerWidth')
        print(tag, 'overflow-x:', ow, '| errors:', errs[:10] or 'none')
        await b.close()
asyncio.run(main(sys.argv[1], int(sys.argv[2]), int(sys.argv[3])))
