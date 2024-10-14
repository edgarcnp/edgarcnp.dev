<section class="section" id="contact">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-12">
                <div class="text-center">
                    <h2><span class="fw-bold">Contact</span> Us</h2>
                    <p class="text-muted mx-auto section-subtitle mt-3">It is a long established fact that a reader will be of a page when established fact looking at its layout.</p>
                </div>
            </div>
        </div>
        <div class="row mt-5">
            <div class="col-lg-4">
                <div class="text-center">
                    <div>
                        <i class="mbri-mobile2 text-primary h1"></i>
                    </div>
                    <div class="mt-3">
                        <h5 class="mb-0 contact_detail-title fw-bold">Call Us On</h5>
                        <p class="text-muted">+985 123 7856</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="text-center">
                    <div>
                        <i class="mbri-letter text-primary h1"></i>
                    </div>
                    <div class="mt-3">
                        <h5 class="mb-0 contact_detail-title fw-bold">Email Us At</h5>
                        <p class="text-muted">Website.Kerri@gmail.com</p>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="text-center">
                    <div>
                        <i class="mbri-pin text-primary h1"></i>
                    </div>
                    <div class="mt-3">
                        <h5 class="mb-0 contact_detail-title fw-bold">Visit Office</h5>
                        <p class="text-muted">202, Grasselli Street , Conway.</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-5">
            <div class="col-lg-12">
                <div class="form-kerri contact_form">
                    <div id="message"></div>
                    <form method="post" action="php/contact.php" name="contact-form" id="working_form">
                        <div class="row">
                            <div class="col-lg-6">
                                <div class="form-group mt-2">
                                    <input name="name" id="name" type="text" class="form-control" placeholder="Your name..." required>
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="form-group mt-2">
                                    <input name="email" id="email" type="email" class="form-control" placeholder="Your email..." required>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="form-group mt-2">
                                <input type="text" class="form-control" id="subject" placeholder="Your Subject.." required />
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-lg-12">
                                <div class="form-group mt-2">
                                    <textarea name="comments" id="comments" rows="4" class="form-control" placeholder="Your message..." required></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-lg-12 text-end mt-2">
                                <button type="submit" id="submit" class="submitBnt btn btn-primary">Send Massage</button>
                                <div id="simple-msg"></div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</section>